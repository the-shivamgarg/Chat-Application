let list = document.querySelector(".list-members");
let triangle = document.querySelector(".triangle-down");
let heading = document.querySelector("#h-box h2");

triangle.addEventListener("click", () => {
    list.classList.toggle("hide-list");
});

heading.addEventListener("click", () => {
    list.classList.toggle("hide-list");
});