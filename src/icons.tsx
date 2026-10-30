import type {CSSProperties} from 'react';

export type IconName = 'arrow'|'down'|'left'|'right'|'search'|'plus'|'minus'|'rotate'|'close'|'document'|'layers'|'check'|'spark';
const paths:Record<IconName,string>={
 arrow:'M5 12h14m-6-6 6 6-6 6',down:'M12 4v16m-6-6 6 6 6-6',
 left:'m14 5-7 7 7 7',right:'m10 5 7 7-7 7',search:'m16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
 plus:'M12 5v14M5 12h14',minus:'M5 12h14',rotate:'M4 8a9 9 0 1 1-1 8M4 3v5h5',
 close:'m6 6 12 12M18 6 6 18',document:'M6 2h8l4 4v16H6zM14 2v5h4M9 12h6m-6 4h6',
 layers:'m12 3 10 5-10 5L2 8zm-10 9 10 5 10-5M2 17l10 5 10-5',
 check:'m4 12 5 5L20 6',spark:'M12 2v20M2 12h20M5 5l14 14M5 19 14-14',
};
export function Icon({name,className,style}:{name:IconName;className?:string;style?:CSSProperties}){
 return <svg className={className??'icon'} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>;
}
export function BrandMark(){return <svg className="brand-symbol" viewBox="0 0 38 38" fill="none" aria-hidden="true"><path d="M6 26V12l13-7 13 7v14l-13 7z" stroke="currentColor" strokeWidth="1.4"/><path d="m6 12 13 8 13-8M19 20v13M12 8l14 8v14" stroke="currentColor" strokeWidth="1.4"/><circle cx="19" cy="20" r="3" fill="currentColor"/></svg>;}
