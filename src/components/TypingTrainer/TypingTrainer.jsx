import { useEffect, useRef, useState } from 'react';
import './TypingTrainer.css'

export default function TypingTrainer() {
    const [typeText, setTypeText] = useState('');
    const parentRef = useRef(null);
    const [timerText, setTimerText] = useState(60);
    const scoreRef = useRef(0);
    const numPressedKeyRef = useRef(0);
    const timerRef = useRef(null);
    const textContainerRef = useRef(null);
    const rateContainer = useRef(null);

    function normalizeText(text) {
        return text
            .replace(/—/g, '-')
            .replace(/[“”«»]/g, '\'')
            .replace(/\u00A0/g, ' ')
            .replace(/…/g, '...')
            .replace(/–/g, '-')
            .replace(/[^\x20-\x7Eа-яА-ЯёЁіІїЇєЄґҐ,.!?'"()\[\]\s\-]/g, '');
    }
    async function getText() {
        const topics = ['Філософія', 'Стародавній Рим', 'Друга світова війна', 'Європа', 'Еволюція', 'Гравітація', 'Музика', 'Ілон Маск'];
        try {
            const res = await fetch('https://uk.wikipedia.org/api/rest_v1/page/summary/' + topics[Math.floor(Math.random() * topics.length)]);
            const data = await res.json();
            setTypeText(normalizeText(data.extract));
        } catch (err) {
            setTypeText(normalizeText('Something went wrong, but you can train on this text! ' + err));
        }
    }
    useEffect(() => {getText()}, []);

    function showStats(timeUsed) {
        const accuracy = ((scoreRef.current / numPressedKeyRef.current) * 100).toFixed(2);
        const speed = scoreRef.current / timeUsed;
        const speedNorm = Math.min(speed / 6, 1);
        const accuracyNorm = Math.min(accuracy / 100, 1);
        const combinedScore = (accuracyNorm * 0.6 + speedNorm * 0.4) * 100;
        const titleRated = ['Жахливо', 'Погано', 'Трохи гірше', 'Середньо', 'Непогано', 'Добре', 'Прекрасно'];
        const index = Math.min(Math.floor((combinedScore / 100) * (titleRated.length - 1)), titleRated.length - 1);

        for(let i = 0; i < rateContainer.current.children.length; i++){
            rateContainer.current.children[i].innerText = [titleRated[index], `${scoreRef.current.toFixed(2)} signs / min.`, `${speed.toFixed(2)} signs / sec.`, `accuracy: ${accuracy}%`][i];
        }
    }

    function typeFunc(event) {
        if (event.key === "Shift" || event.key === "Control") return;
        numPressedKeyRef.current++;
        
        if (event.key === typeText[scoreRef.current] && scoreRef.current < typeText.length - 1) {
            parentRef.current.children[scoreRef.current].style.color = '#00a000ff';
            scoreRef.current++
        } else {
            parentRef.current.style.animationName = 'shakeRootTypingTrainer';
            parentRef.current.children[scoreRef.current].style.color = '#da0000ff';
            setTimeout(() => {
                parentRef.current.children[scoreRef.current].style.color = 'black';
            }, 200);
            setTimeout(() => {
                parentRef.current.style.animationName = 'none';
            }, 100);
        }

        if (scoreRef.current === typeText.length - 1) {
            clearInterval(timerRef.current);
            showStats(60 - timerText);
        }
    }
    function startTyping(){
        textContainerRef.current.style.filter = 'blur(0px)';
        clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setTimerText(prev => {
                if (prev <= 0) {
                    clearInterval(timerRef.current);
                    showStats(60);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }

    return (
        <div className="root-TypingTrainer">
            <div className="timerContainer-TypingTrainer">
                <div>
                    <h2>Тест швидкості друку</h2>
                    <h3>{timerText} / 60 (sec.)</h3>
                    <h3>{(typeText.length - 1) - scoreRef.current} / {typeText.length - 1} signs</h3>
                    <button className='StartTyping' onClick={startTyping}>Start!</button>
                </div>
                <div ref={rateContainer}>
                    <h2></h2>
                    <h3></h3>
                    <h3></h3>
                    <h3></h3>
                </div>
            </div>
            <div
                className='textContainer-TypingTrainer'
                tabIndex={0}
                onKeyDown={typeFunc}
                ref={textContainerRef}
            >
                <p ref={parentRef}>
                    {typeText.split('').map((letter, i) => (
                        <span key={i}>{letter}</span>
                    ))}
                </p>
            </div>
        </div>
    );
}