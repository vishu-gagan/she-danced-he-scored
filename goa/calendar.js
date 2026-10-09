(function(){
  // Goa reception event, same details as the combined invite's itinerary (day 5)
  var goaEvent = {y:2026, mo:12, d:11, h:17, mi:30, dur:4, title:'Goa Wedding Reception', loc:'Mar Vista Beach House, Sernabatim, Goa'};

  function pad(n){ return String(n).padStart(2,'0'); }
  function fmt(dt){
    return dt.y + pad(dt.mo) + pad(dt.d) + 'T' + pad(dt.h) + pad(dt.mi) + '00';
  }
  function buildIcs(e){
    var lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Vishu and Gagan//Wedding//EN','CALSCALE:GREGORIAN'];
    var start = {y:e.y,mo:e.mo,d:e.d,h:e.h,mi:e.mi};
    var end = {y:e.y,mo:e.mo,d:e.d,h:(e.h + e.dur) % 24,mi:e.mi};
    lines.push('BEGIN:VEVENT');
    lines.push('UID:gv-wedding-goa-0@shedancedhescored');
    lines.push('DTSTART:' + fmt(start));
    lines.push('DTEND:' + fmt(end));
    lines.push('SUMMARY:' + e.title + ' — Vishu & Gagan');
    lines.push('LOCATION:' + e.loc);
    lines.push('DESCRIPTION:Time shown is local (IST). See the wedding site for full details.');
    lines.push('END:VEVENT');
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }
  function downloadIcs(content, filename){
    var blob = new Blob([content], {type:'text/calendar;charset=utf-8'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  }
  // the combined invite's day-5 "Add to calendar" button (data-day="5")
  document.querySelectorAll('.ics-btn[data-day="5"]').forEach(function(btn){
    btn.addEventListener('click', function(){
      downloadIcs(buildIcs(goaEvent), 'vishu-gagan-day5.ics');
    });
  });
})();
