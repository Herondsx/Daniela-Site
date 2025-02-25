// func.js
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        document.getElementById("welcome-screen").style.display = "none";
        document.getElementById("enigma-container").style.display = "block";
    }, 6000);
});

let progress = ["_", "_", "_", "_", "_", "_"];
let currentEnigma = 0;

const enigmas = [
    { // F - Sobrenome
        question: "Qual o sobrenome do seu namorado?",
        answer: "ackerman",
        letter: "F"
    },
    { // L - Código Morse
        question: "Desvende a mensagem em código Morse: <br><strong>-. --- -- . / -.. --- / .-.. ..- --. .- .-. / . -- / --.- ..- . / . ... - .- ... ... .- / .--. .-.. .- -. . .--- .- -.. --- / .--. .- .-. .- / . .-.. / - . / .--. . -.. .. .-. / . -- / -. .- -- --- .-. ---</strong>",
        answer: "parque ibirapuera",
        letter: "L"
    },
    { // O - Harry Potter
        question: "Em *Harry Potter*, qual o nome do feitiço usado para desarmar um oponente?",
        answer: "expelliarmus",
        letter: "O"
    },
    { // R - Verity
        question: "No livro *Verity*, qual o nome da autora que descobre o manuscrito chocante?",
        answer: "lowen",
        letter: "R"
    },
    { // E - Sabrina Carpenter
        question: "Complete a letra da música *Espresso*, de Sabrina Carpenter: 'I'm working late, 'cause I'm a ___.'",
        answer: "sinner",
        letter: "E"
    },
    { // S - Pergunta final
        question: "Você me ama? (Responda com 'sim' ou 'não')",
        answer: "sim",
        letter: "S"
    }
];

function checkAnswer() {
    const userAnswer = document.getElementById("answer").value.trim().toLowerCase();
    const feedback = document.getElementById("feedback");
    const wordProgress = document.getElementById("word-progress");

    if (userAnswer === enigmas[currentEnigma].answer) {
        // Atualiza a letra desbloqueada
        progress[currentEnigma] = enigmas[currentEnigma].letter;
        wordProgress.textContent = progress.join(" ");
        feedback.textContent = `Parabéns! Você desbloqueou a letra "${enigmas[currentEnigma].letter}"!`;
        feedback.style.color = "green";

        // Passa para o próximo enigma
        currentEnigma++;
        if (currentEnigma < enigmas.length) {
            setTimeout(() => {
                document.getElementById("enigma-title").textContent = `Enigma ${currentEnigma + 1}: Letra (${enigmas[currentEnigma].letter})`;
                document.getElementById("enigma-question").innerHTML = enigmas[currentEnigma].question;
                document.getElementById("answer").value = "";
                feedback.textContent = "";
            }, 1500);
        } else {
            document.getElementById("enigma-question").innerHTML = "🎉 Parabéns, Daniela! Você completou a palavra <strong>FLORES</strong> e resolveu todos os enigmas! 🌸💖";
            document.getElementById("answer").style.display = "none";
            document.querySelector("button").style.display = "none";
        }
    } else {
        feedback.textContent = "Resposta incorreta. Tente novamente!";
        feedback.style.color = "red";
    }
}
