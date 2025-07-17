import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SlumsResults } from '@/types/dementia';

interface SlumsTestProps {
  language: 'zh-HK' | 'zh-CN';
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  speak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  onComplete: (results: SlumsResults) => void;
}

const SlumsTest = ({
  language,
  isListening,
  startListening,
  stopListening,
  transcript,
  speak,
  isSpeaking,
  onComplete
}: SlumsTestProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const questions = {
    'zh-HK': [
      '今天是星期幾？',
      '你住在哪裡？',
      '你是哪一個城市的？',
      '我給你五個物品名稱，請記住它們：蘋果、汽車、狗、球、床。稍後我會問你。',
      '請你從100開始，每次減去7，連續三次。',
      '你剛才記得的五個物品是什麼？',
      '請我念幾個數字，你反過來說出來。現在試這個：7、4、2。',
      '請完成這句話：火和煙，錘子和____？',
      '你在市場以3元買一個蘋果，買兩個要多少錢？',
      '請重複這句話：今天是個晴朗的日子，我們去公園玩耍。',
      '現在請你描述我剛才說的句子的意思。'
    ],
    'zh-CN': [
      '今天是星期几？',
      '你住在哪里？',
      '你是哪一个城市的？',
      '我给你五个物品名称，请记住它们：苹果、汽车、狗、球、床。稍后我会问你。',
      '请你从100开始，每次减去7，连续三次。',
      '你刚才记得的五个物品是什么？',
      '请我念几个数字，你反过来说出来。现在试这个：7、4、2。',
      '请完成这句话：火和烟，锤子和____？',
      '你在市场以3元买一个苹果，买两个要多少钱？',
      '请重复这句话：今天是个晴朗的日子，我们去公园玩耍。',
      '现在请你描述我刚才说的句子的意思。'
    ]
  };

  useEffect(() => {
    if (currentQuestion < questions[language].length && !isSpeaking) {
      speak(questions[language][currentQuestion]);
    }
  }, [currentQuestion, language, speak, isSpeaking]);

  useEffect(() => {
    if (transcript && isListening) {
      handleAnswer();
    }
  }, [transcript, isListening]);

  const handleAnswer = () => {
    const answer = transcript.trim();
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    const questionScore = scoreAnswer(currentQuestion, answer);
    setScore(prev => prev + questionScore);
    
    stopListening();
    
    if (currentQuestion < questions[language].length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 1500);
    } else {
      // Test complete
      const results: SlumsResults = {
        score: score + questionScore,
        maxScore: 30,
        type: 'slums'
      };
      onComplete(results);
    }
  };

  const scoreAnswer = (questionIndex: number, answer: string): number => {
    const lowerAnswer = answer.toLowerCase();
    
    switch (questionIndex) {
      case 0: // Day of week
        return lowerAnswer.includes('星期') || lowerAnswer.includes('日') ? 1 : 0;
      case 1: // Where you live
        return answer.length > 2 ? 1 : 0;
      case 2: // Which city
        return answer.length > 1 ? 1 : 0;
      case 3: // Remember 5 items (instruction only)
        return 0;
      case 4: // Serial 7s (100-7-7-7)
        if (lowerAnswer.includes('93') || lowerAnswer.includes('86') || lowerAnswer.includes('79')) {
          return 3;
        } else if (lowerAnswer.includes('93') || lowerAnswer.includes('86')) {
          return 2;
        } else if (lowerAnswer.includes('93')) {
          return 1;
        }
        return 0;
      case 5: // Recall 5 items
        const items = ['蘋果', '汽車', '狗', '球', '床', '苹果', '汽车'];
        let recallScore = 0;
        items.forEach(item => {
          if (lowerAnswer.includes(item)) recallScore++;
        });
        return Math.min(recallScore, 5);
      case 6: // Digit span backwards (742 -> 247)
        return lowerAnswer.includes('247') || lowerAnswer.includes('2 4 7') ? 1 : 0;
      case 7: // Analogies (hammer and nail)
        return lowerAnswer.includes('釘') || lowerAnswer.includes('钉') ? 2 : 0;
      case 8: // Math (3x2=6)
        return lowerAnswer.includes('6') || lowerAnswer.includes('六') ? 2 : 0;
      case 9: // Repeat sentence
        return lowerAnswer.includes('晴朗') && lowerAnswer.includes('公園') ? 1 : 0;
      case 10: // Describe sentence meaning
        return answer.length > 5 ? 2 : 0;
      default:
        return 0;
    }
  };

  const skipQuestion = () => {
    setAnswers([...answers, '']);
    if (currentQuestion < questions[language].length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      const results: SlumsResults = {
        score,
        maxScore: 30,
        type: 'slums'
      };
      onComplete(results);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">SLUMS {language === 'zh-HK' ? '測驗' : '测验'}</h2>
        <div className="text-sm text-muted-foreground mb-4">
          {language === 'zh-HK' ? '問題' : '问题'} {currentQuestion + 1} / {questions[language].length}
        </div>
        <div className="w-full bg-muted rounded-full h-2 mb-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions[language].length) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-6">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold">
            {questions[language][currentQuestion]}
          </h3>
          
          {answers[currentQuestion] && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">{language === 'zh-HK' ? '您的回答：' : '您的回答：'}</p>
              <p>{answers[currentQuestion]}</p>
            </div>
          )}
        </div>
      </Card>

      {transcript && (
        <Card className="p-4 bg-muted">
          <p className="text-sm">
            <strong>{language === 'zh-HK' ? '聽到：' : '听到：'}</strong> {transcript}
          </p>
        </Card>
      )}

      <div className="flex justify-center gap-4">
        <Button onClick={skipQuestion} variant="outline" disabled={isSpeaking}>
          {language === 'zh-HK' ? '跳過' : '跳过'}
        </Button>
      </div>
    </div>
  );
};

export default SlumsTest;