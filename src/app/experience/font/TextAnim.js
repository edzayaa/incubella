import anime from "animejs";
import Typed from "typed.js";

//load title
export function loadTitleText(){
  let textWrapper = document.getElementById('main-title');
  console.log(textWrapper)
  textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");
  
  anime.timeline({loop: false})
    .add({
      targets: '.letter',
      translateY: [100,0],
      translateZ: 0,
      opacity: [0,1],
      easing: "easeOutExpo",
      duration: 1400,
      delay: (el, i) => 300 + 30 * i
    }).add({
      targets: '.ml13 .letter',
      translateY: [0,-100],
      opacity: [1,0],
      easing: "easeInExpo",
      duration: 1200,
      delay: (el, i) => 100 + 30 * i
    });
}
// Wrap every letter in a span
export function loadBeginText(){
    let textWrapper = document.getElementById('no-audio-btn');
    console.log(textWrapper)
    textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");
    
    anime.timeline({loop: false})
      .add({
        targets: '.letter',
        translateY: [100,0],
        translateZ: 0,
        opacity: [0,1],
        easing: "easeOutExpo",
        duration: 1400,
        delay: (el, i) => 300 + 30 * i
      }).add({
        targets: '.ml13 .letter',
        translateY: [0,-100],
        opacity: [1,0],
        easing: "easeInExpo",
        duration: 1200,
        delay: (el, i) => 100 + 30 * i
      });
}

export function typeEffect(){
  
const typed = new Typed('#typed', {
  strings: [
    "Musicians...",
    "Community builders...",
    "Podcasts...",
    "Youtubers...",
    "Artists...",
    "Podcasts",
    "Musicians",
    "Artists",
    "Comedians",
    "YouTubers",
    "Fashion Brands",
    "Party Organizers",
    "Event Planners",
    "Content Creators",
    "Trainers",
    "Ecommerce Educators",
    "DAOs",
    "PFP Communities",
    "Secret Societies",
    "Exclusive Experiences",
    "Creative Builders",
    "Entrepreneurs",
    "Course Sellers",
  ],  typeSpeed: 250,
  loop: true
});

}

export function loadFooterText(){
  let textWrapper = document.getElementById('span-footer-text');
  console.log(textWrapper)
  textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");
  
  anime.timeline({loop: false})
    .add({
      targets: '.letter',
      translateY: [100,0],
      translateZ: 0,
      opacity: [0,1],
      easing: "easeOutExpo",
      duration: 1400,
      delay: (el, i) => 300 + 30 * i
    }).add({
      targets: '.ml13 .letter',
      translateY: [0,-100],
      opacity: [1,0],
      easing: "easeInExpo",
      duration: 1200,
      delay: (el, i) => 100 + 30 * i
    });
}

