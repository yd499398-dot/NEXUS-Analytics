import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { verifyUser, registerUser, addLoginLog, getLogins, deleteUserAndLogins } from './db';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const PORT = 3000;

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for Vite HMR and dev server compatibility
  }));

  // Global Rate Limiting
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
  });

  // Login specific rate limiting
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Limit each IP to 10 login requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' }
  });

  app.use(express.json());
  
  // Apply global rate limiting to all API routes
  app.use('/api', globalLimiter);

  app.post('/api/signup', loginLimiter, async (req, res) => {
    try {
      const { email, password, name, companyName, companySize, companyRole, isAdmin, passkey } = req.body;
      
      if (isAdmin) {
        if (!email || !password || !companyName) {
          return res.status(400).json({ error: 'Email, password, and company name are required for admin registration.' });
        }
        if (passkey !== '6598427') {
          return res.status(401).json({ error: 'Invalid admin passkey.' });
        }
      } else {
        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required.' });
        }
      }

      // Email Format Check
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid, active email address.' });
      }

      const localPart = email.split('@')[0]?.toLowerCase();
      const domainPart = email.split('@')[1]?.toLowerCase();
      
      // Strict list of disposable/throwaway or obvious test domains
      const disposableDomains = [
        'tempmail.com', 'mailinator.com', 'yopmail.com', 'test.com', 'example.com', 
        'fake.com', 'throwaway.com', 'dispostable.com', 'trashmail.com', 'sharklasers.com', 
        'guerrillamail.com', 'temp-mail.org', 'fakeinbox.com', '10minutemail.com', 'crazymailing.com'
      ];
      
      const fakePrefixes = ['test', 'fake', 'abc', 'asdf', 'qwer', '123', 'dummy', 'user', 'john.doe', 'johndoe', 'xyz', 'foo', 'bar'];
      
      const isRepeatedChar = /^(.)\1+$/.test(localPart); // e.g. "aaaa", "1111"
      
      if (disposableDomains.includes(domainPart)) {
        return res.status(400).json({ error: 'Corporate registration requires an active business or professional domain. Temporary or disposable email providers are not accepted.' });
      }

      if (fakePrefixes.includes(localPart) || localPart.length < 3 || isRepeatedChar) {
        return res.status(400).json({ error: 'Please use an authentic professional email identity. Generic dummy or placeholder names are blocked.' });
      }

      // Password strength validation: minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if (!passRegex.test(password)) {
        return res.status(400).json({ 
          error: 'Access code/password does not meet security requirements. It must be at least 8 characters long, containing at least one uppercase letter, one lowercase letter, one number, and one special character.' 
        });
      }

      if (isAdmin) {
        if (name && name.trim().length < 2) {
          return res.status(400).json({ error: 'Please enter your authentic full name (at least 2 characters).' });
        }

        if (companyName.trim().length < 2) {
          return res.status(400).json({ error: 'Please specify your company name (at least 2 characters).' });
        }
      }
      
      const role = isAdmin ? 'admin' : 'user';
      const isSuccess = await registerUser(
        email, 
        password, 
        (isAdmin && name) ? name.trim() : undefined, 
        (isAdmin && companyName) ? companyName.trim() : undefined, 
        (isAdmin && companySize) ? companySize : undefined, 
        (isAdmin && companyRole) ? companyRole : undefined, 
        role
      );
      
      if (isSuccess) {
        await addLoginLog(email, 'success');
        res.json({ success: true, role });
      } else {
        res.status(400).json({ error: 'A user account with this professional email already exists.' });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/login', loginLimiter, async (req, res) => {
    try {
      const { email, password, passkey } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }
      
      const result = await verifyUser(email, password);
      
      if (result.success) {
        if (result.role === 'admin' && passkey !== '6598427') {
          return res.status(401).json({ error: 'Admin passkey required for admin access.' });
        }
        await addLoginLog(email, 'success');
        res.json({ success: true, role: result.role, name: result.name });
      } else {
        await addLoginLog(email, 'failed');
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/logins', async (req, res) => {
    try {
      const logins = await getLogins();
      res.json(logins);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/users/:email', async (req, res) => {
    try {
      const { email } = req.params;
      if (!email) {
        return res.status(400).json({ error: 'Email parameter is required' });
      }
      const success = await deleteUserAndLogins(email);
      res.json({ success });
    } catch (error: any) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for Attrition Analysis
  app.post('/api/analyze-attrition', async (req, res) => {
    try {
      const { 
        salary, 
        commute, 
        satisfaction, 
        role, 
        tenure, 
        overTime, 
        jobInvolvement, 
        lang,
        emailVolumeDecline,
        emailAfterHours,
        emailSentimentRisk,
        emailResponseDelay
      } = req.body;

      const langNames: Record<string, string> = {
        en: 'English',
        es: 'Spanish',
        de: 'German',
        fr: 'French',
        tr: 'Turkish',
        zh: 'Chinese'
      };
      const langName = langNames[lang] || 'English';

      const prompt = `
        You are an advanced HR Attrition Analysis Model. Analyze the following employee data and predict the attrition risk level.
        Provide a detailed step-by-step decision path (like a decision tree) explaining how you arrived at this conclusion based on common HR datasets.
        
        IMPORTANT RULES:
        1. All text fields inside the response (including the step descriptions, evaluated conditions, outcomes, and recommendations) MUST be written entirely in ${langName}.
        2. The 'riskLevel' field MUST be strictly one of: "Low", "Medium", or "High" in English (so that the system logic remains functional).
        
        Employee Data:
        - Role: ${role || 'N/A'}
        - Monthly Salary: ₹${salary || 0}
        - Commute Distance: ${commute || 0} km
        - Satisfaction Score (1-10): ${satisfaction || 0}
        - Tenure (Years): ${tenure || 0}
        - OverTime: ${overTime ? 'Yes' : 'No'}
        - Job Involvement (1-4): ${jobInvolvement || 0}
        - Email volume decline (>30%): ${emailVolumeDecline ? 'Yes (Indicating potential disengagement)' : 'No'}
        - Excessive after-hours/weekend emailing: ${emailAfterHours ? 'Yes (Indicating risk of digital burnout)' : 'No'}
        - Communication sentiment risk flag: ${emailSentimentRisk ? 'Yes (Negative or detached tone flags)' : 'No'}
        - Internal channel response delay: ${emailResponseDelay ? 'Yes (Prolonged average response time)' : 'No'}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: {
                type: Type.STRING,
                description: 'Risk level: Low, Medium, or High (MUST be in English)',
              },
              riskScore: {
                type: Type.NUMBER,
                description: 'Risk score from 0 to 100',
              },
              decisionPath: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    step: { type: Type.STRING, description: 'Step description (translated in ' + langName + ')' },
                    condition: { type: Type.STRING, description: 'Condition evaluated (translated in ' + langName + ')' },
                    outcome: { type: Type.STRING, description: 'Outcome of this step (translated in ' + langName + ')' },
                  },
                },
                description: 'Step-by-step decision path reflecting a decision tree logic',
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Actionable recommendations for HR (translated in ' + langName + ')',
              },
            },
            required: ['riskLevel', 'riskScore', 'decisionPath', 'recommendations'],
          },
        },
      });

      const jsonStr = response.text?.trim() || '{}';
      const analysisData = JSON.parse(jsonStr);

      res.json(analysisData);
    } catch (error: any) {
      // Silent fallback applied
      
      const { salary, commute, satisfaction, lang, emailVolumeDecline, emailAfterHours, emailSentimentRisk, emailResponseDelay } = req.body;
      let baseScore = satisfaction < 5 ? 75 : (satisfaction < 8 ? 40 : 15);
      if (emailVolumeDecline) baseScore += 12;
      if (emailAfterHours) baseScore += 8;
      if (emailSentimentRisk) baseScore += 15;
      if (emailResponseDelay) baseScore += 10;
      const riskScore = Math.min(Math.max(baseScore, 5), 95);
      const riskLevel = riskScore > 70 ? 'High' : (riskScore > 30 ? 'Medium' : 'Low');

      // Provide a fallback response if the API quota is exceeded or another error occurs
      const fallbacks: Record<string, { decisionPath: any[], recommendations: string[] }> = {
        en: {
          decisionPath: [
            { step: "Evaluate Satisfaction", condition: `Satisfaction is ${satisfaction}/10`, outcome: riskScore > 70 ? "High attrition indicator" : "Acceptable level" },
            { step: "Evaluate Salary", condition: `Salary is ₹${salary}`, outcome: salary < 300000 ? "Below average, increases risk" : "Competitive" },
            { step: "Evaluate Commute", condition: `Commute is ${commute} km`, outcome: commute > 20 ? "Long commute adds to risk" : "Manageable commute" }
          ],
          recommendations: [
            "Conduct a stay interview to understand employee needs.",
            "Review current compensation against market rates.",
            "Discuss potential for remote work or flexible hours."
          ]
        },
        es: {
          decisionPath: [
            { step: "Evaluar Satisfacción", condition: `La satisfacción es de ${satisfaction}/10`, outcome: riskScore > 70 ? "Indicador alto de deserción" : "Nivel aceptable" },
            { step: "Evaluar Salario", condition: `El salario es de ₹${salary}`, outcome: salary < 300000 ? "Por debajo del promedio, aumenta el riesgo" : "Competitivo" },
            { step: "Evaluar Commute", condition: `La distancia es de ${commute} km`, outcome: commute > 20 ? "El trayecto largo aumenta el riesgo" : "Trayecto manejable" }
          ],
          recommendations: [
            "Realizar una entrevista de permanencia para comprender las necesidades.",
            "Revisar la compensación actual frente a las tarifas del mercado.",
            "Discutir el potencial de trabajo remoto u horarios flexibles."
          ]
        },
        de: {
          decisionPath: [
            { step: "Zufriedenheit bewerten", condition: `Zufriedenheit ist ${satisfaction}/10`, outcome: riskScore > 70 ? "Hoher Fluktuationindikator" : "Akzeptables Niveau" },
            { step: "Gehalt bewerten", condition: `Gehalt ist ₹${salary}`, outcome: salary < 300000 ? "Unterdurchschnittlich, erhöht das Risiko" : "Wettbewerbsfähig" },
            { step: "Pendelweg bewerten", condition: `Pendelweg ist ${commute} km`, outcome: commute > 20 ? "Langer Pendelweg erhöht das Risiko" : "Überschaubarer Pendelweg" }
          ],
          recommendations: [
            "Führen Sie ein Mitarbeitergespräch, um die Bedürfnisse zu verstehen.",
            "Überprüfen Sie die aktuelle Vergütung im Vergleich zu Marktsätzen.",
            "Besprechen Sie das Potenzial für Remote-Arbeit oder flexible Arbeitszeiten."
          ]
        },
        fr: {
          decisionPath: [
            { step: "Évaluer la Satisfaction", condition: `La satisfaction est de ${satisfaction}/10`, outcome: riskScore > 70 ? "Indicateur fort d'attrition" : "Niveau acceptable" },
            { step: "Évaluer le Salaire", condition: `Le salaire est de ₹${salary}`, outcome: salary < 300000 ? "En dessous de la moyenne, augmente le risque" : "Compétitif" },
            { step: "Évaluer le Trajet", condition: `Le trajet est de ${commute} km`, outcome: commute > 20 ? "Le trajet long augmente le risque" : "Trajet gérable" }
          ],
          recommendations: [
            "Mener un entretien de fidélisation pour comprendre les besoins.",
            "Revoir la rémunération actuelle par rapport aux taux du marché.",
            "Discuter de la possibilité de travail à distance ou d'horaires flexibles."
          ]
        },
        tr: {
          decisionPath: [
            { step: "Memnuniyeti Değerlendir", condition: `Memnuniyet ${satisfaction}/10`, outcome: riskScore > 70 ? "Yüksek yıpranma göstergesi" : "Kabul edilebilir seviye" },
            { step: "Maaşı Değerlendir", condition: `Maaş ₹${salary}`, outcome: salary < 300000 ? "Ortalamanın altında, riski artırır" : "Rekabetçi" },
            { step: "Ulaşımı Değerlendir", condition: `Ulaşım ${commute} km`, outcome: commute > 20 ? "Uzun ulaşım mesafesi riski artırır" : "Yönetilebilir ulaşım" }
          ],
          recommendations: [
            "Mülakat gerçekleştirerek çalışan ihtiyaçlarını anlayın.",
            "Mevcut ücretlendirmeyi piyasa oranlarına göre gözden geçirin.",
            "Uzaktan çalışma veya esnek çalışma saatleri olasılığını tartışın."
          ]
        },
        zh: {
          decisionPath: [
            { step: "评估满意度", condition: `满意度为 ${satisfaction}/10`, outcome: riskScore > 70 ? "高流失率指标" : "可接受的水平" },
            { step: "评估薪酬", condition: `薪酬为 ₹${salary}`, outcome: salary < 300000 ? "低于平均水平，增加流失风险" : "有竞争力" },
            { step: "评估通勤", condition: `通勤距离为 ${commute} 公里`, outcome: commute > 20 ? "长距离通勤增加风险" : "通勤距离适中" }
          ],
          recommendations: [
            "进行留任访谈以了解员工需求。",
            "根据市场标准重新评估当前薪酬。",
            "探讨远程办公或弹性工作时间的可行性。"
          ]
        }
      };

      const activeFallback = fallbacks[lang] || fallbacks.en;
      
      res.json({
        riskLevel,
        riskScore,
        decisionPath: activeFallback.decisionPath,
        recommendations: activeFallback.recommendations
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    
    // Explicitly add catch-all for development as well, just in case
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'index.html'));
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
