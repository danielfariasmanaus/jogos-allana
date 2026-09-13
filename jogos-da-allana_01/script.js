(() => {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const VOWELS = ["A","E","I","O","U"];
  const primaryClasses = ["primary-red","primary-blue","primary-yellow","primary-green"];

  const letterThings = {
    A:["🐝","Abelha"], B:["🐋","Baleia"], C:["🐴","Cavalo"], D:["🐬","Golfinho"],
    E:["🐘","Elefante"], F:["🦭","Foca"], G:["🦒","Girafa"], H:["🦛","Hipopótamo"],
    I:["🦎","Iguana"], J:["🐊","Jacaré"], K:["🥝","Kiwi"], L:["🦁","Leão"],
    M:["🐒","Macaco"], N:["🚢","Navio"], O:["🐑","Ovelha"], P:["🐷","Porco"],
    Q:["🧀","Queijo"], R:["🐭","Rato"], S:["🐸","Sapo"], T:["🐢","Tartaruga"],
    U:["🐻","Urso"], V:["🐄","Vaca"], W:["🦭","Morsa"], X:["☕","Xícara"],
    Y:["🐂","Yak"], Z:["🦓","Zebra"]
  };

  const colors = [
    {name:"Preto",hex:"#17171C"},{name:"Azul",hex:"#1678EC"},{name:"Amarelo",hex:"#FFD21C"},
    {name:"Vermelho",hex:"#ED2E3F"},{name:"Branco",hex:"#FFFFFF"},{name:"Verde",hex:"#25AE55"},
    {name:"Roxo",hex:"#8B5BD6"},{name:"Rosa",hex:"#F58DB6"},{name:"Marrom",hex:"#8B5A3C"},{name:"Laranja",hex:"#FF922B"}
  ];

  const pictureItems = [
    ["🐝","Abelha"],["🐋","Baleia"],["🐴","Cavalo"],["🐬","Golfinho"],["🐘","Elefante"],["🦭","Foca"],
    ["🦒","Girafa"],["🦛","Hipopótamo"],["🦎","Iguana"],["🐊","Jacaré"],["🥝","Kiwi"],["🦁","Leão"],
    ["🐒","Macaco"],["🚢","Navio"],["🐑","Ovelha"],["🐷","Porco"],["🧀","Queijo"],["🐭","Rato"],
    ["🐸","Sapo"],["🐢","Tartaruga"],["🐻","Urso"],["🐄","Vaca"],["🦭","Morsa"],["☕","Xícara"],
    ["🐂","Yak"],["🦓","Zebra"],["⚽","Bola"],["🏠","Casa"],["🎲","Dado"],["⭐","Estrela"],
    ["🍴","Garfo"],["🚁","Helicóptero"],["🏝️","Ilha"],["🔑","Chave"],["✏️","Lápis"],["🧦","Meia"],
    ["👓","Óculos"],["🖌️","Pincel"],["🕰️","Relógio"],["🛋️","Sofá"],["📺","Televisão"],["🎻","Violino"]
  ];

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const shuffle = a => [...a].sort(() => Math.random() - .5);
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const pad = n => String(n).padStart(2,"0");
  const fmt = sec => `${pad(Math.floor(sec/60))}:${pad(sec%60)}`;

  let voiceOn = true;
  let musicOn = true;
  let volume = 5;
  let audioCtx = null, musicTimer = null;
  let activeView = "homeView";
  let siteSeconds = 0;
  let questionInterval = null;

  function speak(text, slow=false){
    if(!voiceOn || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.rate = slow ? .66 : .82;
    u.pitch = 1.05;
    u.volume = volume/10;
    speechSynthesis.speak(u);
  }

  function beep(freq=620, duration=.12){
    if(!musicOn || volume === 0) return;
    try{
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = freq; g.gain.value = (volume/10)*.08;
      o.start(); g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+duration); o.stop(audioCtx.currentTime+duration);
    }catch(e){}
  }

  function startSoftMusic(){
    stopSoftMusic();
    if(!musicOn) return;
    const notes=[523,659,784,659];
    let i=0;
    musicTimer=setInterval(()=>{ if(activeView==="homeView") beep(notes[i++%notes.length],.08); },1800);
  }
  function stopSoftMusic(){ if(musicTimer){clearInterval(musicTimer);musicTimer=null;} }

  setInterval(()=>{$("#siteTimer").textContent=fmt(++siteSeconds)},1000);

  $("#volume").addEventListener("input",e=>{volume=+e.target.value;$("#volumeValue").textContent=volume});
  $("#voiceBtn").addEventListener("click",()=>{
    voiceOn=!voiceOn; $("#voiceBtn").setAttribute("aria-pressed",voiceOn);
    $("#voiceBtn").textContent=voiceOn?"🔊 Voz ligada":"🔇 Voz desligada";
    if(!voiceOn && "speechSynthesis" in window) speechSynthesis.cancel();
    else speak("Voz ligada");
  });
  $("#musicBtn").addEventListener("click",()=>{
    musicOn=!musicOn; $("#musicBtn").setAttribute("aria-pressed",musicOn);
    $("#musicBtn").textContent=musicOn?"🎵 Música ligada":"🎵 Música desligada";
    if(musicOn) startSoftMusic(); else stopSoftMusic();
  });

  function showView(id){
    clearInterval(questionInterval); questionInterval=null;
    $$(".view").forEach(v=>v.classList.toggle("active",v.id===id));
    activeView=id;
    window.scrollTo({top:0,behavior:"smooth"});
    if(id==="homeView"){ startSoftMusic(); return; }
    stopSoftMusic();
    if(id==="colorsView") newColorQuestion();
    if(id==="animalsView") newAnimalQuestion();
    if(id==="lettersView") newLetterQuestion();
    if(id==="memoryView") resetMemory();
    if(id==="cardsView") renderAlphabetCards();
  }
  $$("[data-open]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.open)));
  $$("[data-back]").forEach(b=>b.addEventListener("click",()=>showView("homeView")));
  $("#homeBtn").addEventListener("click",()=>showView("homeView"));

  // CORES
  let colorHits=0,colorMisses=0,colorTarget=null,colorQuestionSeconds=0,colorTimer=null;
  function updateColorScore(){
    $("#colorsHits").textContent=colorHits;$("#colorsMisses").textContent=colorMisses;$("#colorsAnswered").textContent=colorHits+colorMisses;
  }
  function startColorTimer(){
    clearInterval(colorTimer);colorQuestionSeconds=0;$("#colorsQuestionTimer").textContent="00:00";
    colorTimer=setInterval(()=>$("#colorsQuestionTimer").textContent=fmt(++colorQuestionSeconds),1000);
  }
  function askColor(){speak(`Onde está o ${colorTarget.name}?`);}
  function newColorQuestion(){
    clearInterval(questionInterval);
    colorTarget=pick(colors);$("#colorTargetName").textContent=colorTarget.name;$("#colorsFeedback").textContent="";
    const opts=shuffle([colorTarget,...shuffle(colors.filter(c=>c!==colorTarget)).slice(0,3)]);
    $("#colorOptions").innerHTML="";
    opts.forEach(c=>{
      const b=document.createElement("button");b.className="color-choice";b.style.background=c.hex;
      b.setAttribute("aria-label",c.name);b.innerHTML=`<span>${c.name}</span>`;
      b.onclick=()=>answerColor(c===colorTarget);$("#colorOptions").appendChild(b);
    });
    startColorTimer();askColor();questionInterval=setInterval(askColor,10000);
  }
  function answerColor(ok){
    if(ok){colorHits++;$("#colorsFeedback").textContent="Muito bem! 🎉";$("#colorsFeedback").className="feedback good";beep(880,.16);speak("Muito bem! Você acertou.");setTimeout(newColorQuestion,900)}
    else{colorMisses++;$("#colorsFeedback").textContent="Tente outra vez 💗";$("#colorsFeedback").className="feedback bad";beep(260,.12);speak("Tente outra vez.");}
    updateColorScore();
  }
  $("#repeatColor").onclick=askColor;
  $("#newColorsRound").onclick=()=>{colorHits=colorMisses=0;updateColorScore();newColorQuestion()};

  // ANIMAIS E OBJETOS
  let animalHits=0,animalMisses=0,animalTarget=null,animalQuestionSeconds=0,animalTimer=null;
  function updateAnimalScore(){
    $("#animalsHits").textContent=animalHits;$("#animalsMisses").textContent=animalMisses;$("#animalsAnswered").textContent=animalHits+animalMisses;
  }
  function startAnimalTimer(){
    clearInterval(animalTimer);animalQuestionSeconds=0;$("#animalsQuestionTimer").textContent="00:00";
    animalTimer=setInterval(()=>$("#animalsQuestionTimer").textContent=fmt(++animalQuestionSeconds),1000);
  }
  function askAnimal(){speak(`Onde está ${animalTarget[1]}?`);}
  function newAnimalQuestion(){
    clearInterval(questionInterval);animalTarget=pick(pictureItems);$("#animalTargetName").textContent=animalTarget[1];$("#animalsFeedback").textContent="";
    const opts=shuffle([animalTarget,...shuffle(pictureItems.filter(x=>x!==animalTarget)).slice(0,3)]);
    $("#animalOptions").innerHTML="";
    opts.forEach(item=>{
      const b=document.createElement("button");b.className="picture-choice";b.innerHTML=`<span>${item[0]}</span><small>${item[1]}</small>`;
      b.onclick=()=>answerAnimal(item===animalTarget);$("#animalOptions").appendChild(b);
    });
    startAnimalTimer();askAnimal();questionInterval=setInterval(askAnimal,10000);
  }
  function answerAnimal(ok){
    if(ok){animalHits++;$("#animalsFeedback").textContent="Você acertou! 🌟";$("#animalsFeedback").className="feedback good";beep(880,.16);speak("Você acertou!");setTimeout(newAnimalQuestion,900)}
    else{animalMisses++;$("#animalsFeedback").textContent="Tente outra vez 💗";$("#animalsFeedback").className="feedback bad";beep(260,.12);speak("Tente outra vez.");}
    updateAnimalScore();
  }
  $("#repeatAnimal").onclick=askAnimal;
  $("#newAnimalsRound").onclick=()=>{animalHits=animalMisses=0;updateAnimalScore();newAnimalQuestion()};

  // LETRAS
  let allowedLetters=[...LETTERS],lettersHits=0,lettersMisses=0,letterTarget="A",letterQuestionSeconds=0,letterTimer=null;
  const picker=$("#letterPicker");
  LETTERS.forEach(l=>{
    const lab=document.createElement("label");lab.className="letter-check";
    lab.innerHTML=`<input type="checkbox" value="${l}" checked><span>${l}</span>`;picker.appendChild(lab);
  });
  function currentMode(){return document.querySelector('input[name="letterMode"]:checked').value}
  $$('input[name="letterMode"]').forEach(r=>r.addEventListener("change",()=>{
    $("#letterPickerWrap").classList.toggle("hidden",currentMode()!=="custom");
    $("#filterError").textContent="";
  }));
  $("#openLetterFilter").onclick=()=>$("#letterFilterPanel").classList.toggle("hidden");
  $("#selectAllLetters").onclick=()=>$$('#letterPicker input').forEach(x=>x.checked=true);
  $("#clearLetters").onclick=()=>$$('#letterPicker input').forEach(x=>x.checked=false);
  $("#applyLetterFilter").onclick=()=>{
    const mode=currentMode();
    if(mode==="all") allowedLetters=[...LETTERS];
    else if(mode==="vowels") allowedLetters=[...VOWELS];
    else{
      allowedLetters=$$('#letterPicker input:checked').map(x=>x.value);
      if(!allowedLetters.length){$("#filterError").textContent="Escolha pelo menos uma letra.";return;}
    }
    $("#filterError").textContent="";
    $("#letterFilterPanel").classList.add("hidden");
    newLetterQuestion();
  };
  function updateLetterScore(){
    $("#lettersHits").textContent=lettersHits;$("#lettersMisses").textContent=lettersMisses;$("#lettersAnswered").textContent=lettersHits+lettersMisses;
  }
  function startLetterTimer(){
    clearInterval(letterTimer);letterQuestionSeconds=0;$("#lettersQuestionTimer").textContent="00:00";
    letterTimer=setInterval(()=>$("#lettersQuestionTimer").textContent=fmt(++letterQuestionSeconds),1000);
  }
  function askLetter(){speak(`Qual é a letra ${letterTarget}?`,true);}
  function buildLetterOptions(){
    const distractPool=LETTERS.filter(l=>l!==letterTarget);
    const opts=shuffle([letterTarget,...shuffle(distractPool).slice(0,3)]);
    $("#letterOptions").innerHTML="";
    opts.forEach((l,i)=>{
      const b=document.createElement("button");b.className=`letter-choice ${primaryClasses[i]}`;b.textContent=l;b.setAttribute("aria-label",`Letra ${l}`);
      b.onclick=()=>answerLetter(l===letterTarget);$("#letterOptions").appendChild(b);
    });
  }
  function newLetterQuestion(){
    clearInterval(questionInterval);$("#letterReward").classList.add("hidden");$("#lettersFeedback").textContent="";
    letterTarget=pick(allowedLetters);buildLetterOptions();startLetterTimer();
    setTimeout(askLetter,250);questionInterval=setInterval(askLetter,7000);
  }
  function answerLetter(ok){
    if(ok){
      lettersHits++;clearInterval(questionInterval);$("#lettersFeedback").textContent="Muito bem! 🎉";$("#lettersFeedback").className="feedback good";beep(900,.16);
      const [emoji,name]=letterThings[letterTarget];$("#rewardEmoji").textContent=emoji;$("#rewardLetter").textContent=letterTarget;$("#rewardName").textContent=name;
      $("#letterReward").classList.remove("hidden");speak(`Muito bem! Letra ${letterTarget}. ${letterTarget} de ${name}.`,true);setTimeout(newLetterQuestion,2300);
    }else{
      lettersMisses++;$("#lettersFeedback").textContent="Tente outra vez 💗";$("#lettersFeedback").className="feedback bad";beep(250,.12);speak("Tente outra vez.",true);
    }
    updateLetterScore();
  }
  $("#repeatLetter").onclick=askLetter;
  $("#newLettersRound").onclick=()=>{lettersHits=lettersMisses=0;updateLetterScore();newLetterQuestion()};

  // MEMÓRIA
  const memorySymbols=["🐶","🦁","🐰","🐸","🐼","🦋","🐠","🌟"];
  let memoryOpen=[],memoryPairs=0,memoryMoves=0,memorySeconds=0,memoryClock=null,memoryLocked=false;
  function resetMemory(){
    clearInterval(memoryClock);memorySeconds=0;memoryPairs=0;memoryMoves=0;memoryOpen=[];memoryLocked=false;
    $("#memoryPairs").textContent="0";$("#memoryMoves").textContent="0";$("#memoryTimer").textContent="00:00";$("#memoryFeedback").textContent="";
    memoryClock=setInterval(()=>$("#memoryTimer").textContent=fmt(++memorySeconds),1000);
    const cards=shuffle([...memorySymbols,...memorySymbols]);$("#memoryBoard").innerHTML="";
    cards.forEach((sym,i)=>{
      const b=document.createElement("button");b.className="memory-card";b.dataset.sym=sym;b.dataset.i=i;b.setAttribute("aria-label","Carta fechada");
      b.onclick=()=>flipMemory(b);$("#memoryBoard").appendChild(b);
    });
  }
  function flipMemory(card){
    if(memoryLocked||card.classList.contains("open")||card.classList.contains("matched"))return;
    card.classList.add("open");card.textContent=card.dataset.sym;memoryOpen.push(card);
    if(memoryOpen.length<2)return;
    memoryMoves++;$("#memoryMoves").textContent=memoryMoves;const[a,b]=memoryOpen;memoryOpen=[];memoryLocked=true;
    if(a.dataset.sym===b.dataset.sym){
      a.classList.replace("open","matched");b.classList.replace("open","matched");memoryPairs++;$("#memoryPairs").textContent=memoryPairs;memoryLocked=false;beep(820,.13);
      if(memoryPairs===memorySymbols.length){clearInterval(memoryClock);$("#memoryFeedback").textContent="Parabéns! Você encontrou todos os pares! 🎉";$("#memoryFeedback").className="feedback good";speak("Parabéns! Você encontrou todos os pares!");}
    }else setTimeout(()=>{[a,b].forEach(c=>{c.classList.remove("open");c.textContent=""});memoryLocked=false},800);
  }
  $("#newMemoryGame").onclick=resetMemory;

  // CARTÕES
  let cardsRendered=false;
  function renderAlphabetCards(){
    if(cardsRendered)return;cardsRendered=true;const wrap=$("#alphabetCards");
    LETTERS.forEach(l=>{
      const [emoji,name]=letterThings[l];const d=document.createElement("div");d.className="alphabet-card";
      d.innerHTML=`<div class="big-letter">${l}</div><div class="big-emoji">${emoji}</div><div class="card-name">${name}</div>`;wrap.appendChild(d);
    });
  }
  $("#printCards").onclick=()=>window.print();

  document.addEventListener("visibilitychange",()=>{if(document.hidden&&"speechSynthesis"in window)speechSynthesis.cancel()});
  startSoftMusic();
})();