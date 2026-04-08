document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const submitBtn = document.getElementById('submit-btn');
    const loading = document.getElementById('loading');
    const resultBox = document.getElementById('result-box');
    const resultLabel = document.getElementById('result-label');
    const resultScore = document.getElementById('result-score');

    // 분석 함수
    const analyzeSentiment = async () => {
        const text = searchInput.value.trim();
        if (!text) return;

        // UI 초기화 (로딩 시작 중)
        resultBox.classList.remove('show');
        loading.style.display = 'block';
        submitBtn.disabled = true;

        try {
            // FastAPI 서버에 POST 요청
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: text })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // 예측값 화면에 렌더링
            setTimeout(() => {
                loading.style.display = 'none';
                submitBtn.disabled = false;
                
                resultLabel.textContent = data.label;
                const percentScore = (data.score * 100).toFixed(1);
                resultScore.textContent = `Estimated with ${percentScore}% confidence`;

                // 컬러셋 처리
                resultLabel.className = 'result-label'; // reset
                if (data.label === 'POSITIVE') {
                    resultLabel.classList.add('label-positive');
                } else {
                    resultLabel.classList.add('label-negative');
                }

                // 애니메이션
                resultBox.classList.add('show');
            }, 500); // UI 전환을 좀 더 부드럽게 보이기 위해 0.5초 딜레이 추가

        } catch (error) {
            console.error('Error:', error);
            loading.style.display = 'none';
            submitBtn.disabled = false;
            alert('An error occurred during analysis. Please try again.');
        }
    };

    // 버튼 클릭 이벤트
    submitBtn.addEventListener('click', analyzeSentiment);

    // 검색창 엔터(Enter) 키 이벤트
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            analyzeSentiment();
        }
    });

    // 텍스트 필드 자동 입력 포커스
    searchInput.focus();
});
