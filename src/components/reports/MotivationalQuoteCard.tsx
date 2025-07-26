'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

const quotes = [
  { quote: "You don’t need more time. You just need to decide.", author: "Seth Godin" },
  { quote: "Small disciplines repeated with consistency every day lead to great achievements.", author: "John Maxwell" },
  { quote: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { quote: "Well done is better than well said.", author: "Benjamin Franklin" },
  { quote: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { quote: "How you spend your days is how you spend your life.", author: "Annie Dillard" },
  { quote: "You don't rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { quote: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { quote: "If you want to make an easy job seem mighty hard, just keep putting off doing it.", author: "Olin Miller" },
  { quote: "Don’t watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { quote: "Either you run the day or the day runs you.", author: "Jim Rohn" },
  { quote: "Amateurs sit and wait for inspiration. The rest of us just get up and go to work.", author: "Stephen King" },
  { quote: "You can't build a reputation on what you are going to do.", author: "Henry Ford" },
  { quote: "What gets scheduled gets done.", author: "Robin Sharma" },
  { quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { quote: "Your mind is for having ideas, not holding them.", author: "David Allen (GTD creator)" },
  { quote: "A day without reflection is a day wasted.", author: "John Maxwell" },
  { quote: "We must all suffer one of two things: the pain of discipline or the pain of regret.", author: "Jim Rohn" },
  { quote: "You cannot escape the responsibility of tomorrow by evading it today.", author: "Abraham Lincoln" },
  { quote: "Success is nothing more than a few simple disciplines, practiced every day.", author: "Jim Rohn" },
  { quote: "Ask yourself if what you’re doing today is getting you closer to where you want to be tomorrow.", author: "Anonymous" },
  { quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { quote: "Don’t let what you cannot do interfere with what you can do.", author: "John Wooden" },
  { quote: "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice...", author: "Pelé" },
  { quote: "When something is important enough, you do it even if the odds are not in your favor.", author: "Elon Musk" },
  { quote: "I think it is possible for ordinary people to choose to be extraordinary.", author: "Elon Musk" },
  { quote: "Do not just build things. Build things that make others want to build things.", author: "Jensen Huang" },
  { quote: "I hope you believe in something. I hope you have the passion and courage to chase it.", author: "Jensen Huang" },
  { quote: "If you never want to be criticized, for goodness’ sake don’t do anything new.", author: "Jeff Bezos" },
  { quote: "In the end, we are our choices.", author: "Jeff Bezos" },
  { quote: "The best investment you can make is in yourself.", author: "Warren Buffett" },
  { quote: "Chains of habit are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
  { quote: "It's fine to celebrate success, but it is more important to heed the lessons of failure.", author: "Bill Gates" },
  { quote: "Don’t compare yourself with anyone in this world. If you do so, you are insulting yourself.", author: "Bill Gates" },
  { quote: "Real artists ship.", author: "Steve Jobs" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Your time is limited, so don’t waste it living someone else’s life.", author: "Steve Jobs" },
  { quote: "Pain + reflection = progress.", author: "Ray Dalio" },
  { quote: "Always deliver more than expected.", author: "Larry Page" },
  { quote: "You never lose a dream. It just incubates as a hobby.", author: "Larry Page" },
  { quote: "Wear your failures as a badge of honor.", author: "Sundar Pichai" },
  { quote: "If somebody offers you an amazing opportunity and you are not sure you can do it, say yes – then learn how to do it later!", author: "Richard Branson" },
  { quote: "You don’t learn to walk by following rules. You learn by doing, and by falling over.", author: "Richard Branson" },
  { quote: "Play long-term games with long-term people.", author: "Naval Ravikant" },
  { quote: "Desire is a contract you make with yourself to be unhappy until you get what you want.", author: "Naval Ravikant" },
];


export function MotivationalQuoteCard() {
    const [currentQuoteIndex, setCurrentQuoteIndex] = React.useState(0);

    React.useEffect(() => {
        // Initialize with a random quote
        setCurrentQuoteIndex(Math.floor(Math.random() * quotes.length));

        const interval = setInterval(() => {
            setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
        }, 10000); // 10 seconds for testing

        return () => clearInterval(interval);
    }, []);

    const currentQuote = quotes[currentQuoteIndex];

    if (!currentQuote) return null;

    return (
        <Card>
            <CardContent className="p-4 flex items-center gap-4">
                <Lightbulb className="h-5 w-5 text-yellow-500 shrink-0" />
                <div className="flex-1">
                    <blockquote className="italic text-center text-sm md:text-base">
                        "{currentQuote.quote}"
                    </blockquote>
                    <p className="text-right text-sm text-muted-foreground font-medium mt-2">— {currentQuote.author}</p>
                </div>
            </CardContent>
        </Card>
    );
}
