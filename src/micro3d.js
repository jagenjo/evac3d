var KEYS={},KEYSP={},MOUSE={pos:[0,0],delta:[0,0],buttons:0}
var CX=0,BODY=document.body
BODY.onkeydown=BODY.onkeyup=function(e){var v=e.type=="keydown",c=e.code.substr(0,3)=="Key"?e.code.substr(3):e.code;KEYSP[c]=(v&&!KEYS[c]);KEYS[c]=v;if(window.ONKEY)ONKEY(e)};
var D2R=0.0174532925,PSIZE=50
var maths=Object.getOwnPropertyNames(Math)
for(var i in maths) window[maths[i].toUpperCase()]=Math[maths[i]]
CLAMP=(a,b,c)=>{return MIN(MAX(a,b),c)}
SATURATE=(a)=>{return CLAMP(a,0,1)}
var F32=Float32Array,F32P=F32.prototype,IDM4=new F32([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])
F32P.MULT=function(v){return v.length==16?MULTMAT4(M4(),this,v):(this.length==16?MAT4xV3(V3(),this,v):V3([this[0]*v[0],this[1]*v[1],this[2]*v[2]]))}
F32P.ADD=function(v){return ADD(V3(),this,v)},F32P.SUB=function(v){return SUB(V3(),this,v)}
F32P.SCALE=function(v){return SCALE(V3(),this,v)}
PALETTE=["#000","#FFF","#333","#777","#AAA","#FAA","#AFA","#AAF","#FD9"]
V3=(v)=>{return new F32(v||3)},UP=V3([0,1,0])
M4=(v)=>{return new F32(v||IDM4)}
var VP_DATA=new F32(4),TEMPV3=V3(),TEMPV3B=V3(),TEMPV4=V3(4)
INIT=(C)=>{CX=C.getContext("2d");VP_DATA.set([0,0,C.width,C.height]);C.width=C.width;C.height=C.height}
INPUT=(C)=>{C.onmousedown=C.onmouseup=C.onmousemove=function(e){MOUSE.delta[0]=e.pageX-MOUSE.pos[0],MOUSE.delta[1]=e.pageY-MOUSE.pos[1],MOUSE.pos[0]=e.pageX,MOUSE.pos[1]=e.pageY;MOUSE.buttons=e.buttons;if(window.ONMOUSE)ONMOUSE(e)}}
VIEWPORT=(x,y,w,h)=>{VP_DATA.set([x,y,w,h])}
TIME=()=>{return performance.now()*.001}
LERP=(a,b,f)=>{return a*(1-f)+b*f;}
ILERP=(a,b,v)=>{return(v-a)/(b-a);}
REMAP=(v,low1,high1,low2,high2)=>{ return LERP(low2,high2,ILERP(low1,high1,v));}
RAND=(v,offset)=>{return RANDOM()*v+(offset||0)}
FRACT=(i)=>{return i-FLOOR(i);}
ADD=(t,n,r)=>{return t[0]=n[0]+r[0],t[1]=n[1]+r[1],t[2]=n[2]+r[2],t}
SUB=(t,n,r)=>{return t[0]=n[0]-r[0],t[1]=n[1]-r[1],t[2]=n[2]-r[2],t}
SCALE=(t,n,r)=>{if(r.length){t[0]=n[0]*r[0],t[1]=n[1]*r[1],t[2]=n[2]*r[2]}else{t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r};return t}
DOT=(t,n)=>{return t[0]*n[0]+t[1]*n[1]+t[2]*n[2]}
CROSS=(t,n,r)=>{var a=n[0],e=n[1],u=n[2],o=r[0],i=r[1],s=r[2];return t[0]=e*s-u*i,t[1]=u*o-a*s,t[2]=a*i-e*o,t}
LEN=(t)=>{var n=t[0],r=t[1],a=t[2];return SQRT(n*n+r*r+a*a)}
LERPV3=(o,a,b,f)=>{for(var i=0;i<o.length;++i)o[i]=a[i]*(1-f)+b[i]*f;return o}
NORM=(t,n)=>{var r=n[0],a=n[1],e=n[2],u=r*r+a*a+e*e;return u>0&&(u=1/SQRT(u),t[0]=n[0]*u,t[1]=n[1]*u,t[2]=n[2]*u),t}
DIST=(t,n)=>{var r=n[0]-t[0],a=n[1]-t[1],e=n[2]-t[2];return SQRT(r*r+a*a+e*e)}
TMAT4=(t,n)=>{t.set(IDM4);return t[12]=n[0],t[13]=n[1],t[14]=n[2],t}
RMAT4=(t,n,r)=>{var e=r[0],u=r[1],o=r[2],i=SQRT(e*e+u*u+o*o),s=void 0,c=void 0,f=void 0;if(i<0.0001)return null;return e*=i=1/i,u*=i,o*=i,s=SIN(n),c=COS(n),f=1-c,t[0]=e*e*f+c,t[1]=u*e*f+o*s,t[2]=o*e*f-u*s,t[3]=0,t[4]=e*u*f-o*s,t[5]=u*u*f+c,t[6]=o*u*f+e*s,t[7]=0,t[8]=e*o*f+u*s,t[9]=u*o*f-e*s,t[10]=o*o*f+c,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t}
SMAT4=(t,n)=>{if(n.constructor===Number)n=[n,n,n];t.set(IDM4);return t[0]=n[0],t[5]=n[1],t[10]=n[2],t}
APPLYTRANS=(m,n,v)=>{var t=TMAT4(M4(),v);return MULTMAT4(m||t,n,t)}
APPLYROT=(m,n,a,v)=>{var r=RMAT4(M4(),a,v);return MULTMAT4(m||r,n,r)}
APPLYSCALE=(m,n,v)=>{var s=SMAT4(M4(),v);return MULTMAT4(m||s,n,s)}
TRS=(m,t,r,s,M)=>{m=m||M4();var T=TMAT4(M4(),t);var R=M4();if(r){if(r[0])APPLYROT(R,R,r[0],[1,0,0]);if(r[1])APPLYROT(R,R,r[1],[0,1,0]);if(r[2])APPLYROT(R,R,r[2],[0,0,1]);}var S=SMAT4(M4(),s);MULTMAT4(m,M||M4(),T);MULTMAT4(m,m,R);return MULTMAT4(m,m,S)}
MULTMAT4=(t,n,r)=>{var a=n[0],e=n[1],u=n[2],o=n[3],i=n[4],s=n[5],c=n[6],f=n[7],M=n[8],h=n[9],l=n[10],v=n[11],d=n[12],b=n[13],m=n[14],p=n[15],P=r[0],A=r[1],E=r[2],O=r[3];return t[0]=P*a+A*i+E*M+O*d,t[1]=P*e+A*s+E*h+O*b,t[2]=P*u+A*c+E*l+O*m,t[3]=P*o+A*f+E*v+O*p,P=r[4],A=r[5],E=r[6],O=r[7],t[4]=P*a+A*i+E*M+O*d,t[5]=P*e+A*s+E*h+O*b,t[6]=P*u+A*c+E*l+O*m,t[7]=P*o+A*f+E*v+O*p,P=r[8],A=r[9],E=r[10],O=r[11],t[8]=P*a+A*i+E*M+O*d,t[9]=P*e+A*s+E*h+O*b,t[10]=P*u+A*c+E*l+O*m,t[11]=P*o+A*f+E*v+O*p,P=r[12],A=r[13],E=r[14],O=r[15],t[12]=P*a+A*i+E*M+O*d,t[13]=P*e+A*s+E*h+O*b,t[14]=P*u+A*c+E*l+O*m,t[15]=P*o+A*f+E*v+O*p,t}
LOOKAT=(t,n,r,u)=>{var o=void 0,i=void 0,s=void 0,c=void 0,f=void 0,M=void 0,h=void 0,l=void 0,v=void 0,d=void 0,b=n[0],m=n[1],p=n[2],P=u[0],A=u[1],E=u[2],O=r[0],R=r[1],y=r[2];if(ABS(b-O)<0.0001&&ABS(m-R)<0.0001&&ABS(p-y)<0.0001)return e(t);h=b-O,l=m-R,v=p-y,d=1/SQRT(h*h+l*l+v*v),o=A*(v*=d)-E*(l*=d),i=E*(h*=d)-P*v,s=P*l-A*h,(d=SQRT(o*o+i*i+s*s))?(o*=d=1/d,i*=d,s*=d):(o=0,i=0,s=0);c=l*s-v*i,f=v*o-h*s,M=h*i-l*o,(d=SQRT(c*c+f*f+M*M))?(c*=d=1/d,f*=d,M*=d):(c=0,f=0,M=0);return t[0]=o,t[1]=c,t[2]=h,t[3]=0,t[4]=i,t[5]=f,t[6]=l,t[7]=0,t[8]=s,t[9]=M,t[10]=v,t[11]=0,t[12]=-(o*b+i*m+s*p),t[13]=-(c*b+f*m+M*p),t[14]=-(h*b+l*m+v*p),t[15]=1,t}
PERSP=(t,n,r,a,e)=>{var u=1/TAN((n*D2R)/2),o=void 0;t[0]=u/r,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=u,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=-1,t[12]=0,t[13]=0,t[15]=0,null!=e&&e!==1/0?(o=1/(a-e),t[10]=(e+a)*o,t[14]=2*e*a*o):(t[10]=-1,t[14]=-2*a);return t}
TRANS3D=(t,n,r)=>{var a=n[0],e=n[1],u=n[2],o=r[3]*a+r[7]*e+r[11]*u+r[15];return o=o||1,t[0]=(r[0]*a+r[4]*e+r[8]*u+r[12])/o,t[1]=(r[1]*a+r[5]*e+r[9]*u+r[13])/o,t[2]=(r[2]*a+r[6]*e+r[10]*u+r[14])/o,t}
PROJ3D=(out,m,a)=>{var ix=a[0],iy=a[1],iz=a[2],ox=m[0]*ix+m[4]*iy+m[8]*iz+m[12],oy=m[1]*ix+m[5]*iy+m[9]*iz+m[13],oz=m[2]*ix+m[6]*iy+m[10]*iz+m[14],ow=m[3]*ix+m[7]*iy+m[11]*iz+m[15];out[0]=(ox/ow+1)/2;out[1]=(oy/ow+1)/2;out[2]=(oz/ow+1)/2;if(out.length>3){out[3]=ow};return out}
TOVIEWPORT=(out,p)=>{var V=VP_DATA;out[0]=REMAP(p[0],0,1,V[0],V[0]+V[2]);out[1]=REMAP(p[1],1,0,0,V[1]+V[3]);return out}
MAT4xV3=(out, m, a)=>{var x=a[0],y=a[1],z=a[2];out[0]=m[0]*x+m[4]*y+m[8]*z+m[12];out[1]=m[1]*x+m[5]*y+m[9]*z+m[13];out[2]=m[2]*x+m[6]*y+m[10]*z+m[14];return out;}
ALPHA=(v)=>{CX.globalAlpha=v}
COLOR=(v,a)=>{if(v.constructor===Number)v=PALETTE[v|0];CX.fillStyle=CX.strokeStyle=v;if(a!=null)CX.globalAlpha=CLAMP(a,0,1)}
var VIEW_M4=M4(),PROJ_M4=M4(),VP_M4=M4(),MVP_M4=M4(),FPLANES=0,CAM_EYE=V3(),CAM_CENTER=V3(),CAM_FRONT=V3(),CAM_RIGHT=V3();
CAMERA=(eye,center,up,fov,aspect,near,far)=>{CAM_EYE.set(eye); CAM_CENTER.set(center);SUB(CAM_FRONT,CAM_CENTER,CAM_EYE);NORM(CAM_FRONT,CAM_FRONT);CROSS(CAM_RIGHT,CAM_FRONT,up);NORM(CAM_RIGHT,CAM_RIGHT); LOOKAT(VIEW_M4,eye,center,up);PERSP(PROJ_M4,fov,aspect,near,far);MULTMAT4(VP_M4,PROJ_M4,VIEW_M4);EXTRACTPLANES(VP_M4)}
//M4xPOINTS=(a,M)=>{var o=[];for(var i=0;i<a.length;++i)o.p(MAT4xV3(V3(),M,a[i]));return o}
//DEINDEX=(i,v)=>{var o=[];for(var j=0;j<i.length;++j)o.p(v[i[j]]);return o}
function POINTS3D(m,M,d,f,t)
{
    if(!m||!m.length)return
    if(M){MULTMAT4(MVP_M4,VP_M4,M)}else MVP_M4.set(VP_M4)
    var p=TEMPV4,V=VP_DATA,s=2,d=d||1;
    CX.beginPath()
    for(var i=0,l=MIN(t||m.length,m.length);i<l;i+=d)
    {
        PROJ3D(p,MVP_M4,m[i|0]);
        if(p[0]<-0.1||p[0]>1.1||p[1]<-0.1||p[1]>1.1||p[2]>1||p[2]<0) continue;
        //s=2+(i%3)/1.5
        s=PSIZE<0?-PSIZE:(PSIZE/POW(p[3],0.8)*(!f?(1+(i%3)/3):1))
        if(s<0.1)continue;
        CX.rect(REMAP(p[0],0,1,V[0],V[0]+V[2])-s/2,REMAP(p[1],1,0,0,V[1]+V[3])-s/2,s,s);
    }
    CX.fill()
}

function SHAPE3D(m,M,stroke,close,clip)
{
    if(!m||!m.length)return
    if(M){MULTMAT4(MVP_M4,VP_M4,M)}else MVP_M4.set(VP_M4)
    var p=TEMPV3,V=VP_DATA
    CX.beginPath()
    var skip=0
    for(var i=0,l=m.length;i<l;i+=1)
    {
        PROJ3D(p,MVP_M4,m[i]);
        if(p[0]<-1 || p[0]>2 || p[1]<-1 || p[1]>2 || p[2]>1 || p[2]<-1) continue;
        CX.lineTo(REMAP(p[0],0,1,V[0],V[0]+V[2]),REMAP(p[1],1,0,0,V[1]+V[3]))
    }
    if(close)CX.closePath()
    if(clip)CX.clip();else if(stroke)CX.stroke();else CX.fill()
}

function LINES3D(m,M)
{
    if(!m||!m.length)return
    if(M){MULTMAT4(MVP_M4,VP_M4,M)}else MVP_M4.set(VP_M4)
    var v=TEMPV3,v2=TEMPV3B,V=VP_DATA
    CX.beginPath()
    for(var i=0;i<m.length-1;i+=2)
    {
        PROJ3D(v,MVP_M4,m[i]);PROJ3D(v2,MVP_M4,m[i+1])
        if(v[2]>1 || v[2]<0 || v2[2]>1 || v2[2]<0) continue;
        CX.moveTo(REMAP(v[0],0,1,V[0],V[0]+V[2]),REMAP(v[1],1,0,0,V[1]+V[3]));
        CX.lineTo(REMAP(v2[0],0,1,V[0],V[0]+V[2]),REMAP(v2[1],1,0,0,V[1]+V[3]));
    }
    CX.stroke()
}

/*
var SEED=30;
HASH2D=(x, y)=>{x=50*FRACT(x*0.3183099+0.71);y=50*FRACT(y*0.3183099+0.113);return -1+2*FRACT(1.375986*SEED+x*y*(x+y));}
NOISE2D=(x, y)=>{let ix=FLOOR(x);let iy=FLOOR(y);let fx=FRACT(x);let fy=FRACT(y);let ux=fx*fx*(3-2*fx);return LERP(LERP(HASH2D(ix,iy),HASH2D(ix+1,iy),ux),LERP(HASH2D(ix,iy+1),HASH2D(ix+1,iy+1),ux),fy*fy*(3-2*fy))}
*/

//frustum
EXTRACTPLANES=(VP)=>{
    FPLANES=[];
    for(var i=0;i<6;++i)
    {
        var s=(i%2?1:-1),j=i>>1,P=new F32([VP[3]+s*VP[j],VP[7]+s*VP[4+j],VP[11]+s*VP[8+j],VP[15]+s*VP[12+j]]),L=LEN(P)
		if(!L)continue;
        for(var j=0;j<4;++j)P[j]/=L;
        FPLANES.p(P)
    }
}

var IS_OUTSIDE=0,IS_INSIDE=1,OVERLAPS=2
DISTTOPLANE=(PL,P)=>{return DOT(PL,P)+PL[3]}
CAMTESTSPHERE=(c,r)=>{
	if(!FPLANES)EXTRACTPLANES(VP_M4);
	var d,over=0
    for(var i=0;i<6;++i){
        d=DISTTOPLANE(FPLANES[i],c)
        if(d<-r) return IS_OUTSIDE;
        else if(d<=r) over=1
    }
	return over?OVERLAPS:IS_INSIDE
}

PLANEOVERLAP=(p,c,hs)=>{
	var r=ABS(hs[0]*p[0])+ABS(hs[1]*p[1])+ABS(hs[2]*p[2]),d=DOT(p,c)+p[3]
	if (d<=-r)return 0;
	return (d<=r)?OVERLAPS:IS_INSIDE
}

CAMTESTBOX=(c,hs)=>{
	if(!FPLANES)EXTRACTPLANES(VP_M4);
	var f=0,o=0;
    for(var i=0;i<6;++i){
        f=PLANEOVERLAP(FPLANES[i],c,hs);
	    if(!f)return 0;
        o+=f==2?1:0;
    }
	return o?OVERLAPS:IS_INSIDE
}
