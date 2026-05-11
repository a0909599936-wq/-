const story = [
  {
    name: "林雨晴",
    text: "下課後，要一起去咖啡廳嗎？"
  },
  {
    name: "你",
    text: "好啊，我剛好也想休息一下。"
  },
  {
    name: "林雨晴",
    text: "聽說你也是電競社的？"
  },
  {
    name: "你",
    text: "對，以後也許能一起參加比賽。"
  },
  {
    name: "林雨晴",
    text: "那就約好了。"
  }
];

let index = 0;

const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const nextBtn = document.getElementById("nextBtn");

function updateScene(){
  nameEl.textContent = story[index].name;
  textEl.textContent = story[index].text;
}

nextBtn.addEventListener("click", ()=>{
  index++;

  if(index >= story.length){
    textEl.textContent = "故事結束";
    nextBtn.style.display = "none";
    return;
  }

  updateScene();
});
