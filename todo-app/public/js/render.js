// HTML 렌더링 함수 모음

// 우선순위 배지 HTML 생성
function renderPriorityBadge(priority) {
  const priorityMap = {
    high: { label: '높음', class: 'priority-high' },
    medium: { label: '중간', class: 'priority-medium' },
    low: { label: '낮음', class: 'priority-low' }
  };

  const prio = priorityMap[priority] || priorityMap.medium;
  return `<span class="priority-badge ${prio.class}">${prio.label}</span>`;
}

// 반복 주기 배지 HTML 생성
function renderRecurrenceBadge(recurrence) {
  if (recurrence === 'none') return '';

  const recurrenceMap = {
    daily: { label: '매일', color: '#3b82f6' },
    weekly: { label: '매주', color: '#8b5cf6' },
    monthly: { label: '매월', color: '#ec4899' }
  };

  const rec = recurrenceMap[recurrence];
  if (!rec) return '';

  return `<span class="recurrence-badge" style="background-color: ${rec.color}20; color: ${rec.color};">${rec.label}</span>`;
}

// 카테고리 배지 HTML 생성
function renderCategoryBadge(category) {
  if (!category) return '';

  return `<span class="category-badge" style="background-color: ${category.color}20; color: ${category.color};">${escapeHtml(category.name)}</span>`;
}

// 통계 카드 HTML 생성
function renderStats(stats) {
  return `
    <div class="grid grid-cols-4 gap-4 text-center">
      <div>
        <p class="text-3xl font-bold text-blue-600" id="totalCount">${stats.total}</p>
        <p class="text-gray-600 text-sm mt-1">전체</p>
      </div>
      <div>
        <p class="text-3xl font-bold text-green-600" id="completedCount">${stats.completed}</p>
        <p class="text-gray-600 text-sm mt-1">완료</p>
      </div>
      <div>
        <p class="text-3xl font-bold text-orange-600" id="progressCount">${stats.progress}</p>
        <p class="text-gray-600 text-sm mt-1">진행중</p>
      </div>
      <div>
        <p class="text-3xl font-bold text-purple-600" id="completionRate">${stats.completionRate}%</p>
        <p class="text-gray-600 text-sm mt-1">달성률</p>
      </div>
    </div>
  `;
}

// Todo 항목 HTML 생성
function renderTodoItem(todo, categories) {
  const completedClass = todo.completed
    ? 'line-through text-gray-400'
    : 'text-gray-800';
  const checkIcon = todo.completed ? '✓' : '';
  const checkboxClass = todo.completed
    ? 'bg-green-500 border-green-500 text-white'
    : 'bg-white border-gray-300';

  // 카테고리 찾기
  const category = categories.find(c => c.id === todo.category_id);

  return `
    <div class="bucket-item bg-white rounded-xl shadow-md p-5 flex items-center gap-3 hover:shadow-lg transition-shadow">
      <!-- 체크박스 -->
      <button
        class="flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${checkboxClass} transition-all hover:scale-110"
        onclick="app.handleToggle(${todo.id})"
        title="완료 토글"
      >
        <span class="text-sm font-bold">${checkIcon}</span>
      </button>

      <!-- 제목 및 메타데이터 -->
      <div class="flex-1 min-w-0">
        <p class="text-lg ${completedClass} break-words">${escapeHtml(todo.title)}</p>
        <div class="flex gap-2 mt-2 flex-wrap">
          ${renderPriorityBadge(todo.priority)}
          ${category ? renderCategoryBadge(category) : ''}
          ${renderRecurrenceBadge(todo.recurrence)}
        </div>
        <p class="text-xs text-gray-400 mt-2">
          ${new Date(todo.created_at).toLocaleDateString('ko-KR')} 생성
          ${todo.completed_at ? ` · ${new Date(todo.completed_at).toLocaleDateString('ko-KR')} 완료` : ''}
        </p>
      </div>

      <!-- 버튼 그룹 -->
      <div class="flex gap-2 flex-shrink-0">
        <button
          class="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
          onclick="app.openEditModal(${todo.id})"
          title="수정"
        >
          수정
        </button>
        <button
          class="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm font-medium"
          onclick="app.handleDelete(${todo.id}, '${escapeHtml(todo.title).replace(/'/g, "\\'")}')"
          title="삭제"
        >
          삭제
        </button>
      </div>
    </div>
  `;
}

// 빈 상태 메시지 HTML 생성
function renderEmptyState(filterType = 'all') {
  const messages = {
    all: '아직 Todo가 없습니다.',
    active: '완료된 Todo가 없습니다.',
    completed: '진행중인 Todo가 없습니다.'
  };

  return `
    <div id="emptyState" class="text-center py-12">
      <p class="text-gray-400 text-lg">${messages[filterType] || messages.all}</p>
      <p class="text-gray-400">위에서 새로운 Todo를 추가해보세요!</p>
    </div>
  `;
}

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
