(function(){
  var K="snaces_theme",t=null;
  try{t=localStorage.getItem(K)}catch(e){}
  document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark");
  document.addEventListener("DOMContentLoaded",function(){
    var b=document.getElementById("themeBtn");if(!b)return;
    var paint=function(){b.textContent=document.documentElement.getAttribute("data-theme")==="light"?"\uD83C\uDF19":"\u2600\uFE0F"};
    paint();
    b.onclick=function(){
      var n=document.documentElement.getAttribute("data-theme")==="light"?"dark":"light";
      document.documentElement.setAttribute("data-theme",n);
      try{localStorage.setItem(K,n)}catch(e){}
      paint();
    };
  });
})();
