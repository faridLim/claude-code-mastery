// 공통 에러 처리 미들웨어

function errorHandler(err, req, res, next) {
  console.error('에러:', err);

  // 데이터베이스 에러
  if (err.message && err.message.includes('UNIQUE constraint failed')) {
    return res.status(400).json({
      success: false,
      error: '이미 존재하는 항목입니다.'
    });
  }

  // 기본 에러 응답
  res.status(err.status || 500).json({
    success: false,
    error: err.message || '서버 오류가 발생했습니다.'
  });
}

module.exports = errorHandler;
