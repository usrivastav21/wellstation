import React from "react";
import noLid from "../assets/dustbin-no-lid.png";
import openLid from "../assets/dustbin-opnlid.png";

function DustbinAnimation() {
  return (
    <section>
      <div className="dustbin-container">
        <img src={openLid} alt="Dustbin lid" className="dustbin-lid" />
        <img src={noLid} alt="Dustbin base" className="dustbin-base" />
      </div>
      <style>{`
        section {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dustbin-container {
          position: relative;
          width: 66px;
          height: 60px;
        }

        .dustbin-base {
          position: absolute;
          width: 60%;
          height: 60%;
          object-fit: contain;
        }

        .dustbin-lid {
          position: absolute;
          width: 60%;
          height: auto;
          top: -15px;
          z-index: 2;
          transform-origin: 12% 100%;
          animation: lidRotate 1.5s infinite ease-in-out;
        }

        @keyframes lidRotate {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(-45deg); }
        }
      `}</style>
    </section>
  );
}

export default DustbinAnimation;
