/* 全站廣告欄位（首頁＋104 個工具共用）
   ─────────────────────────────────────────────
   設定檔 ads/config.json 是唯一的開關：enabled=false 時什麼都不做。
   每個欄位優先放「自售廣告」（house，廠商直接贊助），沒有可用的自售
   廣告才放 Google AdSense；兩者都沒開就保持隱藏，不留空白。

   欄位位置：
   - 首頁：index.html 裡的 <div data-ad-slot="home">。
   - 工具頁：由 jrh-core 以 data-placement="tool" 載入本檔；工具頁若有
     <div data-ad-slot="tool"> 就放那裡，否則自動加在頁面最下方。
   一律不出現在列印／PDF（@media print 隱藏），也不放在計算、列印按鈕旁。
   點擊與曝光記到 GA（house_ad_impression / house_ad_click），不經後端。 */
(function(){
  if(window.__jrhAdsLoaded)return;
  window.__jrhAdsLoaded=true;

  var me=document.currentScript;
  var base=me?new URL(me.src).origin:location.origin;
  var placement=(me&&me.dataset.placement)||'home';
  var CSS='.jrh-ad{max-width:1200px;margin:18px auto;padding:0 16px;box-sizing:border-box;font-family:"Noto Sans TC","Segoe UI",sans-serif;}'+
    '.jrh-ad[hidden]{display:none!important;}'+
    '.jrh-ad-label{font-size:10.5px;color:#9A9382;letter-spacing:.08em;margin-bottom:4px;}'+
    '.jrh-ad-card{display:flex;gap:14px;align-items:center;padding:12px 14px;border:1px solid #E2DDD1;border-radius:10px;background:#fff;color:#0A1A33;text-decoration:none;}'+
    '.jrh-ad-card:hover{border-color:#9A7B2A;}'+
    '.jrh-ad-card img{width:88px;height:66px;object-fit:cover;border-radius:6px;flex-shrink:0;}'+
    '.jrh-ad-title{font-weight:700;font-size:14px;}'+
    '.jrh-ad-text{font-size:12.5px;color:#555;margin-top:2px;line-height:1.6;}'+
    '.jrh-ad-sponsor{font-size:11px;color:#7E641F;margin-top:3px;}'+
    'body.is-filtering .jrh-ad[data-placement="home"]{display:none!important;}'+
    'main .jrh-ad{max-width:none;padding:0;margin:0 0 22px;}'+
    '@media print{.jrh-ad{display:none!important;}}';

  function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
  function ga(name,params){try{if(window.gtag)window.gtag('event',name,params);}catch(e){}}
  function isMember(){try{return !!localStorage.getItem('jrh_cloud_token');}catch(e){return false;}}
  function safeUrl(u){return /^https:\/\//i.test(String(u||''))?String(u):'';}

  function pickHouse(cfg){
    if(!cfg.house||!cfg.house.enabled)return null;
    var t=today();
    var list=(cfg.house.items||[]).filter(function(it){
      return it&&it.active&&safeUrl(it.url)&&(it.placements||[]).indexOf(placement)>=0&&
        (!it.start||it.start<=t)&&(!it.end||it.end>=t);
    });
    if(!list.length)return null;
    var total=list.reduce(function(s,it){return s+(it.weight>0?it.weight:1);},0),r=Math.random()*total;
    for(var i=0;i<list.length;i++){r-=(list[i].weight>0?list[i].weight:1);if(r<=0)return list[i];}
    return list[list.length-1];
  }

  function renderHouse(box,it){
    var label=document.createElement('div');label.className='jrh-ad-label';label.textContent='贊助廠商';
    var a=document.createElement('a');a.className='jrh-ad-card';a.href=safeUrl(it.url);
    a.target='_blank';a.rel='sponsored noopener';
    if(safeUrl(it.image)){var img=document.createElement('img');img.src=it.image;img.alt='';img.loading='lazy';a.appendChild(img);}
    var body=document.createElement('div');
    var t=document.createElement('div');t.className='jrh-ad-title';t.textContent=it.title||'';body.appendChild(t);
    if(it.text){var p=document.createElement('div');p.className='jrh-ad-text';p.textContent=it.text;body.appendChild(p);}
    if(it.sponsor){var s=document.createElement('div');s.className='jrh-ad-sponsor';s.textContent=it.sponsor;body.appendChild(s);}
    a.appendChild(body);
    a.addEventListener('click',function(){ga('house_ad_click',{ad_id:it.id,placement:placement});});
    box.appendChild(label);box.appendChild(a);box.hidden=false;
    ga('house_ad_impression',{ad_id:it.id,placement:placement});
  }

  var adsenseLoaded=false;
  function renderAdSense(box,cfg){
    var a=cfg.adsense||{},slot=a.slots&&a.slots[placement];
    if(!a.enabled||!/^ca-pub-\d{16}$/.test(a.client||'')||/^ca-pub-0+$/.test(a.client)||!slot)return false;
    if(!adsenseLoaded){
      adsenseLoaded=true;
      var s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';
      s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+encodeURIComponent(a.client);
      document.head.appendChild(s);
    }
    var label=document.createElement('div');label.className='jrh-ad-label';label.textContent='廣告';
    var ins=document.createElement('ins');ins.className='adsbygoogle';ins.style.display='block';
    ins.setAttribute('data-ad-client',a.client);ins.setAttribute('data-ad-slot',slot);
    ins.setAttribute('data-ad-format','auto');ins.setAttribute('data-full-width-responsive','true');
    box.appendChild(label);box.appendChild(ins);box.hidden=false;
    (window.adsbygoogle=window.adsbygoogle||[]).push({});
    return true;
  }

  function slots(){
    var found=Array.prototype.slice.call(document.querySelectorAll('[data-ad-slot="'+placement+'"]'));
    if(!found.length&&placement==='tool'){
      var d=document.createElement('div');d.setAttribute('data-ad-slot','tool');
      document.body.appendChild(d);found=[d];
    }
    return found;
  }

  function run(cfg){
    if(!cfg||!cfg.enabled)return;
    if((cfg.excludePaths||[]).indexOf(location.pathname)>=0)return;
    if(cfg.hideForMembers&&isMember())return;
    var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
    slots().forEach(function(box){
      box.classList.add('jrh-ad');box.setAttribute('data-placement',placement);box.hidden=true;
      var it=pickHouse(cfg);
      if(it)renderHouse(box,it);else renderAdSense(box,cfg);
    });
  }

  /* 設定檔每 10 分鐘最多重抓一次（GitHub Pages 本身也快取約 10 分鐘） */
  fetch(base+'/ads/config.json?v='+Math.floor(Date.now()/600000),{credentials:'omit'})
    .then(function(r){return r.ok?r.json():null;})
    .then(function(cfg){
      if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){run(cfg);});
      else run(cfg);
    })
    .catch(function(){});
})();
