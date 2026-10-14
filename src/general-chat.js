// Simple public lobby: read-only for guests, posting requires an Arcana account.
let timer=null,opened=false,me=null,loading=false;
const qs=id=>document.getElementById(id);
const overlay=()=>qs('arcanaChatOverlay');
function status(text){const el=qs('arcanaChatStatus');if(el)el.textContent=text;}
function authorControls(item,wrap){
 if(!me)return;
 const canRemove=item.authorId===me.id||me.permissions?.hideContent;
 const button=document.createElement('button');button.type='button';
 button.textContent=canRemove?'Remove':'Report';
 button.addEventListener('click',async()=>{
  if(!canRemove&&!window.confirm('Report this message to Arcana moderators?'))return;
  try{const res=await fetch(canRemove?'/api/chat/messages/'+encodeURIComponent(item.id):'/api/chat/report',{
   method:canRemove?'DELETE':'POST',
   headers:canRemove?{}:{'content-type':'application/json'},
   credentials:'same-origin',
   body:canRemove?undefined:JSON.stringify({id:item.id})
  });const body=await res.json();if(!res.ok)throw Error(body.error||'Action failed');
  status(canRemove?'Message removed.':'Report received. Thank you.');await refreshChat();
  }catch(err){status(err.message||'Unable to update message.');}
 });
 wrap.append(button);
}
function drawMessages(items){
 const list=qs('arcanaChatMessages');if(!list)return;
 const nearEnd=list.scrollHeight-list.scrollTop-list.clientHeight<70;
 list.replaceChildren();
 if(!items.length){const p=document.createElement('p');p.className='arcanaChatStatus';p.textContent='No messages yet. Start the conversation.';list.append(p);}
 for(const item of items){
  const card=document.createElement('article');card.className='arcanaChatMessage'+(me?.id===item.authorId?' mine':'');
  const head=document.createElement('header');const name=document.createElement('strong');name.textContent=item.name||'Arcana player';
  const time=document.createElement('time');time.dateTime=item.createdAt;time.textContent=new Date(item.createdAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
  head.append(name,time);const body=document.createElement('p');body.textContent=item.message||'';card.append(head,body);
  authorControls(item,card);list.append(card);
 }
 if(nearEnd)list.scrollTop=list.scrollHeight;
}
async function refreshChat(){
 if(!opened||loading)return;
 loading=true;
 try{const res=await fetch('/api/chat/messages?limit=75',{cache:'no-store',credentials:'same-origin'});
  const value=await res.json();if(!res.ok)throw Error(value.error||'Chat unavailable.');
  drawMessages(Array.isArray(value.messages)?value.messages:[]);
  if(!me)status('Messages are public. Sign in to send messages.');
  else status('Keep it friendly. Messages refresh every 12 seconds.');
 }catch(error){status(error.message||'Unable to load chat.');}
 finally{loading=false;}
}
function closeChat(){opened=false;const el=overlay();if(el)el.hidden=true;if(timer){clearInterval(timer);timer=null;}}
async function openChat(currentAccount){
 me=currentAccount?.()||null;const el=overlay();if(!el)return;
 el.hidden=false;opened=true;
 qs('arcanaChatForm').hidden=!me;qs('arcanaChatSignIn').hidden=!!me;
 qs('arcanaChatMessages').replaceChildren();
 status('Loading messages…');
 await refreshChat();timer=setInterval(()=>{void refreshChat()},12000);
}
export function initGeneralChat(currentAccount){
 const trigger=qs('generalChatBtn'),el=overlay();if(!trigger||!el)return;
 trigger.addEventListener('click',()=>{if(opened)closeChat();else void openChat(currentAccount)});
 qs('arcanaChatClose')?.addEventListener('click',closeChat);
 el.addEventListener('click',e=>{if(e.target===el)closeChat()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&opened){e.stopPropagation();closeChat()}});
 qs('arcanaChatForm')?.addEventListener('submit',async e=>{
  e.preventDefault();const input=qs('arcanaChatInput'),send=qs('arcanaChatSend'),message=input?.value.trim();
  if(!message)return;send.disabled=true;
  try{const res=await fetch('/api/chat/messages',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({message})});
   const result=await res.json();if(!res.ok)throw Error(result.error||'Unable to send message.');
   input.value='';await refreshChat();input.focus({preventScroll:true});
  }catch(err){status(err.message||'Unable to send.');}
  finally{send.disabled=false;}
 });
 window.addEventListener('arcana:account-updated',()=>{if(opened){me=currentAccount?.()||null;qs('arcanaChatForm').hidden=!me;qs('arcanaChatSignIn').hidden=!!me;void refreshChat()}});
}
