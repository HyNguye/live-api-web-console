
import React, { useState, useEffect } from "react";
interface TypingEffectProps {
  text: string;
    setText: (text: string) => void;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ text,setText }) => {
    const [displayedText, setDisplayedText] = useState<string>("");
    const [index, setIndex] = useState<number>(0);
    const reset = () => {
        setDisplayedText(""); 
        setIndex(0);
    }
  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, 30); // Tốc độ gõ, điều chỉnh thời gian (ms) để nhanh/chậm hơn
      return () => clearTimeout(timer);
    }
  }, [index, text]);

  // Reset khi text thay đổi
  useEffect(() => {
    reset();
  }, [text]);

  return (
    <div className="dialogue">
      {displayedText}
      <span className="cursor">|</span>
      <span id="deleteBtn" onClick={() => setText("")}>
        X
      </span>
    </div>
  );
};

export default TypingEffect;
