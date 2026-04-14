const storageKey = "nampo-22-district-posts";

const defaultPosts = [
  {
    id: 3,
    title: "이번 주 구역모임 안내",
    author: "윤진석 집사님",
    date: "2026-04-14",
    content: "이번 주일 오후 2시에 교육관 모임실에서 22구역모임 예배가 있습니다.\n기도 제목을 미리 준비해 오시면 함께 나누겠습니다."
  },
  {
    id: 2,
    title: "4월 친교 모임 공지",
    author: "22구역 총무",
    date: "2026-04-10",
    content: "4월 마지막 주에는 예배 후 간단한 다과와 친교 시간이 있습니다.\n함께 오셔서 풍성한 교제의 시간을 나눠 주세요."
  },
  {
    id: 1,
    title: "새가족 환영",
    author: "남포교회 22구역",
    date: "2026-04-03",
    content: "22구역모임에 새롭게 함께하시는 분들을 진심으로 환영합니다.\n궁금한 점은 구역장에게 편하게 문의해 주세요."
  }
];

function loadPosts() {
  const stored = localStorage.getItem(storageKey);
  if (!stored) {
    localStorage.setItem(storageKey, JSON.stringify(defaultPosts));
    return [...defaultPosts];
  }

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.setItem(storageKey, JSON.stringify(defaultPosts));
    return [...defaultPosts];
  }
}

function savePosts(posts) {
  localStorage.setItem(storageKey, JSON.stringify(posts));
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function renderRecentPosts(posts) {
  const recentPosts = document.querySelector("#recent-posts");
  recentPosts.innerHTML = "";

  posts.slice(0, 3).forEach((post) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    const meta = document.createElement("span");

    link.href = "#board";
    link.dataset.postId = String(post.id);
    link.className = "recent-link";
    link.textContent = post.title;

    meta.className = "recent-meta";
    meta.textContent = `${post.author} · ${formatDate(post.date)}`;

    item.append(link, meta);
    recentPosts.appendChild(item);
  });
}

function renderPostList(posts) {
  const postList = document.querySelector("#post-list");
  postList.innerHTML = "";

  posts.forEach((post, index) => {
    const row = document.createElement("tr");
    const numberCell = document.createElement("td");
    const titleCell = document.createElement("td");
    const authorCell = document.createElement("td");
    const dateCell = document.createElement("td");
    const button = document.createElement("button");

    numberCell.textContent = String(posts.length - index);
    authorCell.textContent = post.author;
    dateCell.textContent = formatDate(post.date);

    button.className = "post-link";
    button.type = "button";
    button.dataset.postId = String(post.id);
    button.textContent = post.title;

    titleCell.appendChild(button);
    row.append(numberCell, titleCell, authorCell, dateCell);
    postList.appendChild(row);
  });
}

function renderPostDetail(post) {
  const detail = document.querySelector("#post-detail");

  if (!post) {
    detail.className = "detail-body empty-state";
    detail.textContent = "게시글을 찾을 수 없습니다.";
    return;
  }

  detail.className = "detail-body";
  detail.innerHTML = "";

  const title = document.createElement("h4");
  const meta = document.createElement("div");
  const author = document.createElement("span");
  const date = document.createElement("span");
  const content = document.createElement("div");

  title.className = "detail-title";
  title.textContent = post.title;

  meta.className = "detail-meta";
  author.textContent = `작성자 ${post.author}`;
  date.textContent = `작성일 ${formatDate(post.date)}`;
  meta.append(author, date);

  content.className = "detail-content";
  content.textContent = post.content;

  detail.append(title, meta, content);
}

function getNextId(posts) {
  return posts.reduce((maxId, post) => Math.max(maxId, post.id), 0) + 1;
}

function initializeBoard() {
  let posts = loadPosts().sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);

  const syncBoard = (selectedId) => {
    renderRecentPosts(posts);
    renderPostList(posts);

    if (selectedId) {
      const selectedPost = posts.find((post) => post.id === selectedId);
      renderPostDetail(selectedPost);
    }
  };

  syncBoard(posts[0]?.id);

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const postId = target.getAttribute("data-post-id");
    if (!postId) {
      return;
    }

    event.preventDefault();
    const selectedPost = posts.find((post) => post.id === Number(postId));
    renderPostDetail(selectedPost);
    document.querySelector("#board")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const postForm = document.querySelector("#post-form");
  postForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const authorInput = document.querySelector("#author");
    const titleInput = document.querySelector("#title");
    const contentInput = document.querySelector("#content");

    const newPost = {
      id: getNextId(posts),
      author: authorInput.value.trim(),
      title: titleInput.value.trim(),
      content: contentInput.value.trim(),
      date: new Date().toISOString().slice(0, 10)
    };

    if (!newPost.author || !newPost.title || !newPost.content) {
      return;
    }

    posts = [newPost, ...posts];
    savePosts(posts);
    syncBoard(newPost.id);
    postForm.reset();
  });
}

initializeBoard();
