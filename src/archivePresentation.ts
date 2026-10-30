/** Editorial navigation labels, never substituted for the immutable original text. */
export const recordSubjects:Record<string,{name:string;kind:string}>={
 M01:{name:'A sound in the hall',kind:'Cooling fan'},
 M02:{name:'The nightly reset',kind:'Relay clock'},
 M03:{name:'The empty shift',kind:'Corridor speaker'},
 M04:{name:'Light through the rain',kind:'Lighting circuit'},
 M05:{name:'Someone was here',kind:'Inspection visit'},
 M06:{name:'A needle that stayed',kind:'Pressure gauge'},
 M07:{name:'Three quiet nights',kind:'Capacitor repair'},
 M08:{name:'Before the records',kind:'Missing files'},
};
export const displayDate=(date:string)=>/^\d{4}-\d{2}-\d{2}/.test(date)?date.slice(0,10):date;
export const shortDate=(date:string)=>{
 const d=new Date(date);return Number.isNaN(+d)?date:new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',timeZone:'UTC'}).format(d);
};
