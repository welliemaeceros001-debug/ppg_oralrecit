"use strict";
const STORAGE_KEY = "ppg-recitation-quest-v1";
const $ = (id) => document.getElementById(id);
const freshState = () => ({ usedQuestionIds: [], completedLearners: [], history: [], currentLearner: "", currentQuestions: [], teacherMode: false });
let state = loadState();

function loadState(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.usedQuestionIds) || !Array.isArray(saved.completedLearners)) return freshState();
    return { ...freshState(), ...saved };
  } catch { return freshState(); }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function sample(array, count){
  const copy = [...array];
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
  return copy.slice(0,count);
}
function availableLearners(){ return LEARNERS.filter(n => !state.completedLearners.includes(n)); }
function availableQuestions(){ return QUESTIONS.filter(q => !state.usedQuestionIds.includes(q.id)); }

function populateLearners(){
  const select = $("learnerSelect");
  const previous = select.value;
  select.innerHTML = '<option value="">Choose a learner...</option>';
  availableLearners().forEach(name => { const option=document.createElement("option"); option.value=name; option.textContent=name; select.append(option); });
  if (availableLearners().includes(previous)) select.value=previous;
}
function selectLearner(name){
  state.currentLearner=name; state.currentQuestions=[];
  $("learnerSelect").value=name;
  $("selectedLearner").textContent=name || "No learner selected";
  $("drawBtn").disabled=!name || availableQuestions().length<2;
  $("completeBtn").disabled=true;
  renderQuestionStage();
}
function drawQuestions(){
  if(!state.currentLearner || state.currentQuestions.length) return;
  const pool=availableQuestions();
  if(pool.length<2){ alert("Fewer than two questions remain."); return; }
  state.currentQuestions=sample(pool,2);
  state.usedQuestionIds.push(...state.currentQuestions.map(q=>q.id));
  saveState();
  $("learnerSelect").disabled=true; $("randomLearnerBtn").disabled=true;
  $("drawBtn").disabled=true; $("completeBtn").disabled=false;
  renderQuestionStage(); updateStats();
}
function renderQuestionStage(){
  const stage=$("questionStage");
  if(state.currentQuestions.length===2){
    stage.innerHTML=state.currentQuestions.map(q=>`<article class="question-card reveal"><span class="question-number">Question ${q.id}</span><p>${escapeHtml(q.question)}</p><div class="answer">Answer: ${escapeHtml(q.answer)}</div></article>`).join("");
  } else {
    stage.innerHTML='<article class="question-card placeholder"><span class="question-number">Q?</span><p>The first drawn question will appear here.</p><div class="answer">Answer hidden</div></article><article class="question-card placeholder"><span class="question-number">Q?</span><p>The second drawn question will appear here.</p><div class="answer">Answer hidden</div></article>';
  }
}
function completeLearner(){
  if(!state.currentLearner || state.currentQuestions.length!==2) return;
  const entry={ learner:state.currentLearner, questions:state.currentQuestions, completedAt:new Date().toISOString() };
  state.history.push(entry); state.completedLearners.push(state.currentLearner);
  state.currentLearner=""; state.currentQuestions=[]; saveState();
  $("learnerSelect").value=""; $("learnerSelect").disabled=false; $("selectedLearner").textContent="No learner selected"; $("completeBtn").disabled=true; $("drawBtn").disabled=true;
  renderAll();
}
function undoLast(){
  const last=state.history.pop(); if(!last) return;
  state.completedLearners=state.completedLearners.filter(n=>n!==last.learner);
  const ids=last.questions.map(q=>q.id); state.usedQuestionIds=state.usedQuestionIds.filter(id=>!ids.includes(id));
  saveState(); renderAll(); selectLearner(last.learner);
}
function randomLearner(){ const pool=availableLearners(); if(pool.length) selectLearner(sample(pool,1)[0]); }
function updateStats(){
  $("questionsLeft").textContent=availableQuestions().length;
  $("learnersDone").textContent=`${state.completedLearners.length}/${LEARNERS.length}`;
  $("learnersLeft").textContent=availableLearners().length;
  $("sessionStatus").textContent=availableLearners().length===0?"Complete":state.history.length?"In Progress":"Ready";
  $("undoBtn").disabled=state.history.length===0; $("randomLearnerBtn").disabled=availableLearners().length===0;
}
function renderHistory(){
  $("historyCount").textContent=`${state.history.length} ${state.history.length===1?"entry":"entries"}`;
  $("historyList").innerHTML=state.history.length ? [...state.history].reverse().map((e,i)=>`<div class="history-item"><strong>${state.history.length-i}. ${escapeHtml(e.learner)}</strong><span>Q${e.questions[0].id}: ${escapeHtml(e.questions[0].question)}<br>Q${e.questions[1].id}: ${escapeHtml(e.questions[1].question)}</span><br><small>${new Date(e.completedAt).toLocaleString()}</small></div>`).join("") : '<p class="empty">No completed recitations yet.</p>';
}
function toggleTeacherMode(){ state.teacherMode=!state.teacherMode; saveState(); document.body.classList.toggle("teacher-on",state.teacherMode); $("teacherModeBtn").textContent=`Teacher Mode: ${state.teacherMode?"ON":"OFF"}`; $("teacherModeBtn").setAttribute("aria-pressed",String(state.teacherMode)); }
function exportHistory(){
  if(!state.history.length){alert("There is no history to export yet.");return;}
  const quote=v=>`"${String(v).replaceAll('"','""')}"`;
  const rows=[["Learner","Question 1 No.","Question 1","Answer 1","Question 2 No.","Question 2","Answer 2","Completed At"],...state.history.map(e=>[e.learner,e.questions[0].id,e.questions[0].question,e.questions[0].answer,e.questions[1].id,e.questions[1].question,e.questions[1].answer,new Date(e.completedAt).toLocaleString()])];
  const blob=new Blob(["\ufeff"+rows.map(r=>r.map(quote).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`PPG_Recitation_History_${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(a.href);
}
function resetSession(){ state=freshState(); localStorage.removeItem(STORAGE_KEY); document.body.classList.remove("teacher-on"); $("learnerSelect").value=""; $("selectedLearner").textContent="No learner selected"; renderAll(); }
function escapeHtml(value){ const d=document.createElement("div");d.textContent=value;return d.innerHTML; }
function renderAll(){ populateLearners(); updateStats(); renderHistory(); renderQuestionStage(); $("learnerSelect").disabled=state.currentQuestions.length===2; $("completeBtn").disabled=state.currentQuestions.length!==2; $("drawBtn").disabled=!state.currentLearner || state.currentQuestions.length===2 || availableQuestions().length<2; if(state.currentLearner){$("learnerSelect").value=state.currentLearner; $("selectedLearner").textContent=state.currentLearner;} document.body.classList.toggle("teacher-on",state.teacherMode); $("teacherModeBtn").textContent=`Teacher Mode: ${state.teacherMode?"ON":"OFF"}`; }

$("learnerSelect").addEventListener("change",e=>selectLearner(e.target.value));
$("randomLearnerBtn").addEventListener("click",randomLearner); $("drawBtn").addEventListener("click",drawQuestions); $("completeBtn").addEventListener("click",completeLearner); $("undoBtn").addEventListener("click",undoLast); $("teacherModeBtn").addEventListener("click",toggleTeacherMode); $("exportBtn").addEventListener("click",exportHistory); $("resetBtn").addEventListener("click",()=>$("resetDialog").showModal()); $("confirmResetBtn").addEventListener("click",resetSession);
renderAll();
