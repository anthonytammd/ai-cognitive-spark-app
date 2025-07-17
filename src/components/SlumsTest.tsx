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
      '我想問問你，今天是星期幾呀？',
      '你現在住在哪裡呢？可以跟我說說嗎？',
      '那你是住在哪一個城市的？',
      '好的，現在我要給你五個東西的名字，等一下我會問你記不記得。準備好了嗎？它們是：蘋果、汽車、狗、球、床。你先重複一次給我聽聽。',
      '現在我們來做個小小的數學遊戲。你從100開始，每次減去7，連續減三次。慢慢來，不用緊張。',
      '很好！現在你還記得剛才我說的那五樣東西嗎？試試看能想起多少個。',
      '接下來我們玩個倒著說數字的遊戲。我說7、4、2，你倒過來說，應該是2、4、7。來試試看吧！',
      '我們來完成一句話。你知道火和煙是一對的，那麼錘子和什麼是一對的呢？',
      '我問你一個生活上的小問題。如果蘋果一個賣3元，那買兩個要多少錢呢？',
      '請你跟著我說這句話：今天是個晴朗的日子，我們去公園玩耍。',
      '剛才那句話的意思是什麼？用你自己的話告訴我。'
    ],
    'zh-CN': [
      '我想问问你，今天是星期几呀？',
      '你现在住在哪里呢？可以跟我说说吗？',
      '那你是住在哪一个城市的？',
      '好的，现在我要给你五个东西的名字，等一下我会问你记不记得。准备好了吗？它们是：苹果、汽车、狗、球、床。你先重复一次给我听听。',
      '现在我们来做个小小的数学游戏。你从100开始，每次减去7，连续减三次。慢慢来，不用紧张。',
      '很好！现在你还记得刚才我说的那五样东西吗？试试看能想起多少个。',
      '接下来我们玩个倒着说数字的游戏。我说7、4、2，你倒过来说，应该是2、4、7。来试试看吧！',
      '我们来完成一句话。你知道火和烟是一对的，那么锤子和什么是一对的呢？',
      '我问你一个生活上的小问题。如果苹果一个卖3元，那买两个要多少钱呢？',
      '请你跟着我说这句话：今天是个晴朗的日子，我们去公园玩耍。',
      '刚才那句话的意思是什么？用你自己的话告诉我。'
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
    
    // Add natural acknowledgments
    const acknowledgments = {
      'zh-HK': ['好的', '明白了', '收到', '很好', '嗯嗯'],
      'zh-CN': ['好的', '明白了', '收到', '很好', '嗯嗯']
    };
    
    const randomAck = acknowledgments[language][Math.floor(Math.random() * acknowledgments[language].length)];
    
    if (currentQuestion < questions[language].length - 1) {
      setTimeout(() => {
        speak(randomAck).then(() => {
          setTimeout(() => {
            setCurrentQuestion(prev => prev + 1);
          }, 800);
        });
      }, 500);
    } else {
      // Test complete
      const finalMessage = language === 'zh-HK' 
        ? '好的，我們的對話就到這裡了。謝謝你今天跟我聊天！' 
        : '好的，我们的对话就到这里了。谢谢你今天跟我聊天！';
      
      setTimeout(() => {
        speak(finalMessage).then(() => {
          const results: SlumsResults = {
            score: score + questionScore,
            maxScore: 30,
            type: 'slums'
          };
          onComplete(results);
        });
      }, 500);
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