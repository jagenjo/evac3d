var HELP=`EVAC Copter OS 1.0
********************
Find the cars in distress
Land near them to evacuate survivors
Carry them to nearest hospitalw
Good luck`.split("\n")
var HELP_KEYS="[Mouse]=steering  [W][S]=thrust  [Space]=Turbo  [A][D]=Roll  [Q][E]=Lean  [F]=Display  [I]=Invert-Y [L]=Quality"

//initialize lots of vars and some renames for shortness
var L3D=LINES3D,P3D=POINTS3D,S3D=SHAPE3D,Z3=[0,0,0],RND=RANDOM,CDX=0,CDY=0
var AP=Array.prototype;AP.p=AP.push;AP.random=()=>{return this[RAND(this.length)|0]}
var ACX=0,BUF=0,ADEST=0,AVOL=0,AT=0,ACHANNELS=[],READY=0,ASEQS=[[80,82,81,85,83],[80,80,82,80,84,84,85,85],[90,92,94,96,98,100],[70,69,68,67,66,65,64,63,62,61,60,59]],ASEQI=0,TALERT=0
PM=M4();PPOS=PM.subarray(12,15);PFRONT=PM.subarray(8,11);PPOSXZ=V3()
PVEL=V3(Z3),PYAW=0,PPOWER=.5,PFORCE=0,PFUEL=1,PTURB=0,SHK=0,LIVES=4,HP=1,YAXIS=1,LOADED=0,PERSON=0,SCORE=0,TARGETS=[],ZOOM=1,ZL=[1,200,70,40,15],look=0
F=0,PREV=TIME(),NOW=PREV,Q=1,NBLOCKS=0,NDOTS=0,GTIME=0,NTIME=0,NTARGET=0
var eye=V3(),center=V3(),up=V3(),FOV=65

//AUDIO
NEWCHANNEL=()=>{
    var osc=ACX.createOscillator(),noise=ACX.createBufferSource(),filter=ACX.createBiquadFilter(),gain=ACX.createGain()
    osc.frequency.value=0;noise.buffer=BUF;noise.loop=true;filter.frequency.value=10000;gain.gain.value=0;
    osc.connect(gain);noise.connect(filter);filter.connect(gain);gain.connect(AVOL)
    var ch={osc,noise,filter,gain};
    ACHANNELS.p(ch)
    return ch;
}

STARTAUDIO=()=>{
    ACX=new AudioContext();ADEST=ACX.destination;AVOL=ACX.createGain()
    AVOL.gain.value=.5,AVOL.connect(ADEST)//main volume
    //create white noise
    var s=2*ACX.sampleRate;BUF=ACX.createBuffer(1,s,ACX.sampleRate),data=BUF.getChannelData(0);
    for (var i=0;i<s;i++)data[i]=RANDOM()*2-1;
    //three game channels
    for(var i=0;i<3;++i)NEWCHANNEL()
    ACHANNELS[0].noise.start()//copter sound
    ACHANNELS[1].osc.start()//alerts
    ACHANNELS[2].noise.start()//wind sound
}

//some geometry
var dash=[[-3,-1,0],[3,-1,0],[4,-5,0],[2,-5,0],[2,-7,0],[-2,-7,0],[-2,-5,0],[-4,-5,0]]
sqr=[[-1,-1,0],[1,-1,0],[1,1,0],[-1,1,0]]
glyV=[[0,2,0],[1,2,0],[0,1,0],[1,1,0],Z3,[1,0,0],[.5,1,0]]
glyI=[[0,1,5,4,0],[2,1,5],[0,1,3,2,4,5],[0,1,2,5,4],[3,2,1,5],[1,0,2,3,5,4],[1,2,4,5,3,2],[0,1,4],[0,1,4,5,0],[3,2,0,1,5],[4,0,5,1],[1,0,2,3,2,4,5],[1,0,2,3,5,4],[0,4,6,5,1]]
glys=[];for(var i=0;i<14;++i){var n=[];glys.p(n);for(var j=0;j<glyI[i].length;++j)n.p(glyV[glyI[i][j]])}
circle=[],circleY=[],circle4=[],circleR=[],stars=[],blocks={},grid=[]
for(var i=0;i<2*PI;i+=(2*PI/100)){var x=SIN(i),y=COS(i);circle.p(V3([x,y,0]));circleY.p(V3([x,0,y]));circle4.p(V3([SIN(i/4),0,COS(i/4)]))}
i=PI*1.4;while(i<PI*2.6){circleR.p(V3([SIN(i)*RAND(100,128),RND()*0.5,COS(i)*RAND(100,128)]));i+=RND()*0.03;}
for(var i=0;i<200;++i){
    var v=V3([RND()-0.5,(RND()-0.5)*0.4,RND()-0.5])
    if(v[1]<0)v[1]*=-1;
    stars.p(NORM(v,v))
}

//some containers
var HOSPs=[[279,0,243],[581,0,465],[700,0,158],[848,0,414]],cars=[],Ps=[],roads=[],SMK=[],clouds=[],lightsW=[],lightsR=[]
PM.set(HOSPs[0],12)

INPUT(C)

ADDL=(V,s)=>{
    var x=FLOOR(V[0]/64);
    var z=FLOOR(V[2]/64);
    var b=blocks[x+":"+z];
    if(!b)
        b=blocks[x+":"+z]={l:[]}
    if(s)b.l.splice(FLOOR(b.l.length*RND()),0,V);
    else b.l.p(V)
}

//creates a street/road
NEWROAD=(v1,v2,l,s,n,f)=>{
    var N=DIST(v1,v2)
    if(N>100)
    {
        var v3=LERPV3(V3(),v1,v2,.5);
        NEWROAD(v1,v3,l,s,n,f);
        NEWROAD(v3,v2,l,s,n,f);
        return;
    }
    roads.p(v1,v2),f=f||.5
    for(var i = 0; i <= N*f; ++i)
    {
        var V=LERPV3(V3(),v1,v2,(i+(n?RAND(.1,-.05):0))/(N*f));
        if(n)V=V.ADD([RAND(.1,-.05),.2,RAND(.1,-.05)])
        if(l)l.p(V)
        else ADDL(V,s)
        //if(s)l.splice(FLOOR(l.length*RND()),0,V);
        //else l.p(V)
    }
}

//creates the city layout plus the clouds
/*
CITY=(sx,sz)=>{
    var lights=[]
    //clouds
    for(var i=0;i<16384;++i)
    {
        var x=(i%128)+sx, z=FLOOR(i/128)+sz;
        h=NOISE2D(x*0.05+1000,z*0.05+1000)
        if(h>0.5)clouds.p(V3([x+RND(),20-h,z+RND()]))
    }
    //eixample streets
    for(var j=0;j<=16;++j)
    {
        var rx=sx+j*8,rz=sz+j*8
        NEWROAD(V3([rx,0,sz+0.5]),V3([rx,0,sz+128+(j%2)*8]),0,1,1)
        if(j==8)NEWROAD(V3([rx+1,0,sz+0.5]),V3([rx+1,0,sz+128+(j%5)*8]),0,1,1)
        NEWROAD(V3([sx-(j%3)*8+0.5,0,rz]),V3([sx+128+(j%5)*8,0,rz]),0,1,1)
    }

    //coast
    for(var j=0;j<300;++j)
    {
        var x=RAND(200,-100)
        lights.p(V3([x,RAND(.5),-64-RAND(ABS(SIN(x/9)*4))]))
        if(j<10)
            lightsW.push(V3([RAND(500,-250),0,-100-RAND(100)]))
    }

    //diagonal street
    NEWROAD(V3([sx,0,sz]),V3([sx+128,0,sz+128]),0,1,1)
    NEWROAD(V3([sx-0.2,0,sz+0.2]),V3([sx+127.2,0,sz+128.2]),0,1,1)
    return {lights}
}
*/

//emits a particle
EMIT=(p,v,t)=>{var P=[V3(p),V3(v),t];Ps.p(P);return P}

//build city
//var city=CITY(-64,-64)
var city={lights:[],clouds:[]}
var lastR=roads.length;
fetch("barna.bin").then((resp)=>resp.arrayBuffer()).then((a)=>{
    var data=new Int16Array(a);
    for(var i=0;i<data.length;i+=4)
        NEWROAD(V3([data[i]/2,0,data[i+1]/2]),V3([data[i+2]/2,0,data[i+3]/2]),0,1,1);
    lastR=roads.length;
    TARGETS=[]
    extraWorld()
})

function extraWorld(){
    //build airport
    NEWROAD(V3([100,0,-1]),V3([150,0,-1]),lightsW)
    NEWROAD(V3([100,0,0]),V3([150,0,0]),lightsW,0,0,.5)
    NEWROAD(V3([100,0,1]),V3([150,0,1]),lightsW)
    NEWROAD(V3([98,0,-2.5]),V3([98,0,2.5]),lightsR)

    //build hospital lights
    for(var i=0;i<HOSPs.length;++i)
    {
        var v=HOSPs[i]
        NEWROAD(V3([-1.5,0,1]).ADD(v),V3([1.5,0,1]).ADD(v),lightsW,0,0,2)
        NEWROAD(V3([-1.5,0,-1]).ADD(v),V3([1.5,0,-1]).ADD(v),lightsW,0,0,2)
        NEWROAD(V3([.1,0,1]).ADD(v),V3([.1,0,-1]).ADD(v),lightsW,0,0,2)
    }
}

function SINGLEPOINTS3D(m,M,d,f)
{
    if(!m||!m.length)return
    if(M){MULTMAT4(MVP_M4,VP_M4,M)}else MVP_M4.set(VP_M4)
    var p=TEMPV4,V=VP_DATA,s=2,d=d||1;
    for(var i=0,l=m.length;i<l;i+=d)
    {
        PROJ3D(p,MVP_M4,m[i|0]);
        if(p[0]<-0.1 || p[0]>1.1 || p[1]<-0.1 || p[1]>1.1 || p[2]>1) continue;//p[2]<0 ||
        s=(PSIZE/POW(p[3],0.8)*(!f?(1+(i%3)/3):1))
        CX.fillRect(REMAP(p[0],0,1,V[0],V[0]+V[2])-s/2,REMAP(p[1],1,0,0,V[1]+V[3])-s/2,s,s);
    }
}

for(var ix=-8;ix<=8;++ix)
for(var iz=-8;iz<=8;++iz)
    grid.p(V3([ix,0,iz]))

//main loop
loop=()=>{
    NBLOCKS=NDOTS=0
    requestAnimationFrame(loop)
    //mouse from -1..1
    var BTN=MOUSE.buttons,MDX=((MOUSE.pos[0]/C.width)-.5)*(BTN?1:.5),MDY=YAXIS*((MOUSE.pos[1]/C.height)-.5)*-(BTN?1:.5)
    if(!BTN){CDX=MDX,CDY=MDY}
    else if(!READY){READY=1;Ps.length=GTIME=0;if(!ACX&&LIVES)STARTAUDIO();NTIME=10;/*BODY.requestPointerLock();*/}
    NOW=TIME();F++
    var dt=MIN(0.1,NOW-PREV);PREV=NOW;GTIME+=dt;NTIME-=dt
    C.width = BODY.offsetWidth; C.height=BODY.offsetHeight

    //start rendering
    INIT(C),CX.lineWidth=2,CX.globalCompositeOperation="lighter"

    if(!READY) //INTRO
    {
        COLOR(6,(GTIME-2)/4)
        //CX.font="14px Arial";CX.textAlign="left"
        //CX.fillText(HELP_KEYS,10,20)
        CX.font="200px Verdana";CX.textAlign="center"
        CX.fillText("EVAC3D",C.width*.5-(MAX(0,5-NOW)*8),C.height*.5)
        COLOR(0,1)
        CX.globalCompositeOperation="source-over"
        CX.fillText("EVAC3D",C.width*.5+4,C.height*.5+4)
        COLOR(6,(GTIME-6)/6)
        CX.font="30px Verdana";CX.textAlign="left"
        COLOR(8,(GTIME-6)*.5)
        CX.fillText("by @TAMAT for the #JK13K 2022",C.width*.5-240,C.height-40)
        if(F%2==0)EMIT([410,0,240],[RAND(1,-.2)/3,.5+RAND(1),RAND(1,-.5)/3],8)
    }
    else if(GTIME<10)
    {
    }

    var INTROF=POW(1-SATURATE(GTIME/2-4),3)

    //set up camera based on PLAYER MODEL
    MAT4xV3(eye,PM,[0,0.1,0])
    MAT4xV3(up,PM,UP)
    SUB(up,up,eye)
    //center also applies slight movements based on mouse and cam shake
    MAT4xV3(center,PM,[MDX*(1-INTROF)+look,MDY*(1-INTROF)+RAND(SHK),-1]),SHK*=0.9
    SCALE(PPOSXZ,PPOS,[1,0,1])

    if(!READY){
        eye=[SIN(NOW/9)*50+400,30,COS(NOW/8)*50+200],center=[410,0,200],up=[0,1,0]
    }
    else
    {
        FOV=LERP(65,40,INTROF);
        center[1]=LERP(center[1],0,INTROF);
    }

    //assign camera to build internal matrices
    CAMERA(eye,center,up,FOV,C.width/C.height,.1,500)

    //now lets draw world from FAR to NEAR
    COLOR(LIVES?"#AAC":1,1)
    var t=TMAT4(M4(),eye)
    PSIZE=1
    //stars
    if(LIVES)
        P3D(stars,t);
    else 
        L3D(stars,t)
    //horizon lights
    if(Q)
    {
        COLOR(2)
        P3D(circleY,t,1)
        COLOR(8,.4)
        PSIZE=50
        P3D(circleR)
    }

    //draw grid
    if(PPOS[1]<4)
    {
        COLOR(1,.3-PPOS[1]*.05),PSIZE=10
        P3D(grid,TMAT4(M4(),[FLOOR(PPOS[0]),0,FLOOR(PPOS[2])]),1,1)
    }

    //draw lights per block
    var PPX=FLOOR(PPOS[0]/64),PPZ=FLOOR(PPOS[2]/64),QB=Q?6:3
    for(var ix=-QB+PPX;ix<=QB+PPX;ix++)
    for(var iz=-QB+PPZ;iz<=QB+PPZ;iz++)
    {
        var bx=(ix*64),bz=(iz*64),d=DIST(PPOS,[bx,PPOS[1],bz])
        var b=blocks[ix+":"+iz]
        if(!b||!CAMTESTBOX([bx+32,0,bz+32],[32,1,32]))continue;
        NBLOCKS++
        var max=b.l.length;
        if(d>750)max*=0.25
        else if(d>500)max*=0.5
        else if(d>250)max*=0.75
        //street lights
        if(Q){ //if HIQH QUALITY draw lights twice, but bigger to cheap glow effect
            COLOR(8,.03),PSIZE=300,SINGLEPOINTS3D(b.l,0,1,0,max/4)
        }
        COLOR(8,.7),PSIZE=40
        P3D(b.l,0,1,0,max)
        NDOTS+=(max*(Q?1.5:1))|0
    }

    //populate cars in random positions of the streets
    cars=[]
    for(var j=0;j<lastR;j+=2)
    {
        var r1=roads[j],r2=roads[j+1]
        if(DIST(eye,LERPV3(TEMPV3,r1,r2,.5))>150)
            continue
        var d=DIST(r1,r2)
        for(var k=0,l=(d>>1);k<=l;k++)
        {
            //f=(((NOW+1e5)*0.31+k+SIN(k*123+NOW*.1))%d)/d
            f=FRACT((NOW*.3+k+SIN(k*123+NOW*.1))/l)
            //if(j%4==0||j%6==0)f=1-f
            cars.p(LERPV3(V3(),r1,r2,f))
        }
    }

    //add extra point on cars list for target
    TARGETS.forEach((a)=>cars.p(a.pos))

    //draw white/red lights
    COLOR(1)
    P3D(lightsW)
    COLOR("#F33",1)
    P3D(lightsR)
    if(!READY&&((F/10)|0)%2){
        var t=SIN(GTIME/10);PSIZE=-4
        P3D([LERPV3(V3(),HOSPs[0],[410,0,240],t)])
    }

    //cycle items in array to give blinking effect
    if(!(F%5)&&lightsW.length)
        lightsW.unshift(lightsW.pop());
    if(!(F%5)&&lightsR.length)
        lightsR.unshift(lightsR.pop());

    //draw cars
    COLOR(1,.4);PSIZE=40
    P3D(cars,0,1,1)
    CX.globalCompositeOperation="source-over"

    //draw smoke particles and clouds
    COLOR(2,.5),PSIZE=LIVES?100:10
    SINGLEPOINTS3D(SMK,0,1,1)
    COLOR(2,.5)
    if(Q){PSIZE=200;SINGLEPOINTS3D(clouds)}
    PSIZE=50

    //fill the smoke array with the current particles
    SMK=[]
    for(var i=0;i<Ps.length;++i){
        var P=Ps[i];SMK.p(P[0]);
        ADD(P[0],P[0],P[1].SCALE(dt));
        P[2]-=dt
    }
    //remove dead particles
    Ps=Ps.filter((a)=>a[2]>0)

    //emit smoke on target
    TARGETS.forEach((TRG)=>{
        if(!((F%10)|0)&&TRG.time<100)
            EMIT(TRG.pos,[RAND(1,-.2)/9,.2+RAND(1,-.5)/6,RAND(1,-.5)/9],20)
    })

    //emit on floor
    if(PPOS[1]<2&&(PFORCE>1)&&HP)
        EMIT([PPOS[0],0,PPOS[2]],[RAND(1,-.5),0,RAND(1,-.5)],4)
    //emit on copter if broken
    if(HP<.2&&!(F%10)&&LIVES)
        EMIT(PPOS,Z3,6)

    if(!READY)
        return

    //COPTER *******************

    //draw copter blades
    if(LIVES){
        COLOR(8,1)
        S3D(circle4,TRS(0,[0,20,0],[0,POW(NOW,3),0],40,PM),1)
        S3D(circle4,TRS(0,[0,20,0],[0,POW(NOW,4)+PI/2,0],30,PM),1)
    }

    //draw dashboard
    var DM=APPLYTRANS(M4(),PM,[0,-2+INTROF*3,-10])

    //draw cockpit base
    var m=TRS(0,[0,7,0],0,[.8,-1,.8],DM)
    COLOR(0,1);S3D(dash,m);COLOR(2);S3D(dash,m,1,1)
    var m=TRS(0,[0,-8,0],0,[1,3,1],DM)
    COLOR(0,1);S3D(sqr,m);COLOR(2);S3D(sqr,m,1,1)
    COLOR(0,1);S3D(dash,DM);COLOR(2);S3D(dash,DM,1,1)

    //compute the PLAYER YAW
    PYAW=ATAN2(PFRONT[0],PFRONT[2])

    //set some alerts and dials on the dashboard
    var dials=[],ALRT=[]
    if((PFUEL<0.1&&((F/4)|0)%2)||PTURB>0.1)ALRT.p([0,-2.35,0])
    var valids=TARGETS.filter((a)=>a.mode)
    for(var i=0;i<valids.length;++i)if(valids[i].time>50||((F/2)%2))ALRT.p([-1.1-i*.2,-1.1,0])
    dials.p([-2.5,-2,0],[-2.5+SIN(PPOS[1])*.5,-2+COS(PPOS[1])*.5,0],[-2.5,-2,0],[-2.5+SIN(PPOS[1]/10)*.3,-2+COS(PPOS[1]/10)*.3,0], [0,-2,0],[SIN(PFUEL*4.2-2.2)*.45,-2+COS(PFUEL*4.2-2.2)*.45,0])
    
    //draw the widgets in the dashboard (circles and squares)
    var hu=.52;PSIZE=-2
    S3D(circle,TRS(0,[-2.5,-2,0],0,hu,DM),1,1)
    P3D(circle,TRS(0,[-2.5,-2,0],0,hu-.1,DM),5,1)
    S3D(circle,TRS(0,[-1.25,-2,0],0,hu,DM),1,1)
    S3D(circle,TRS(0,[0,-2,0],0,hu,DM),1,1)
    v=circle.slice(0,70)//cheap trick to get cool dial for fuel: use not all points
    S3D(v,TRS(0,[0,-2,0],[0,0,2.2],hu-.05,DM),1,1)
    P3D(v,TRS(0,[0,-2,0],[0,0,2.2],hu-.08,DM),2,1)
    S3D(sqr,TRS(0,[2,-3,0],0,[1,0.1,0],DM),1,1)//speed meter
    S3D(sqr,TRS(0,[2,-3.3,0],0,[1,0.1,0],DM),1,1)//turbo meter
    S3D(sqr,TRS(0,[2,-3.6,0],0,[1,0.1,0],DM),1,1)//hp meter
    S3D(sqr,TRS(0,[1.9,-.6,0],0,[.5,.01,0],DM))//h line
    S3D(sqr,TRS(0,[1.9,-.6,0],0,[.01,.5,0],DM))//v line
    S3D(sqr,TRS(0,[-1.2,-3.8,0],0,[2,1,0],DM),1,1) //computer

    //draw the overview screens background
    COLOR(3,.2),PSIZE=50
    var gps=TRS(0,[0,-0.2,0],0,1,DM)
    S3D(sqr,gps)
    S3D(sqr,TRS(0,[1.9,-.6,0],0,.5,DM))//landing meter

    TARGETS.forEach((t)=>t.dist=DIST(t.pos,PPOS))
    TARGETS.sort((a,b)=>a.dist-b.dist)
    NTARGET=TARGETS[0]

    //draw the green widgets and screens in the dashboard
    COLOR("#585",1)
    if(LIVES||RND()>((LIVES&&HP<.25)?.5:.9))
    {
        //draw the distance to target line
        if(LOADED>=1||TARGETS[0]&&(TARGETS[0].dist>1.5||((F/8)|0)%2==0))
            S3D(sqr,TRS(0,[0,-1.3,0],0,[CLAMP(4-TARGETS[0].dist,0,2),0.02,0.1],DM))

        //draw the widget dials
        if(GTIME>3.5)
        {
            L3D(dials,DM,1)
            var M=TRS(0,[-1.25,-2,0],[0,0,-PYAW-PI/2],.1,DM)
            S3D(glys[10],M.MULT(TMAT4(M4(),[-.5,2,0])),1)
            S3D(glys[11],M.MULT(TMAT4(M4(),[3,-1,0])),1)
            S3D(glys[12],M.MULT(TMAT4(M4(),[-.5,-4,0])),1)
            S3D(glys[13],M.MULT(TMAT4(M4(),[-4,-1,0])),1)
        }

        if(INTROF==1)
        {
        MULTMAT4(MVP_M4,VP_M4,DM)
        var pos=TOVIEWPORT(V3(),PROJ3D(V3(),MVP_M4,[-2.9,-3.1,0]))
        CX.font="20px Courier New"
        for(var i=0;i<MIN(HELP.length,(HELP.length*GTIME*.25)|0);++i)
            CX.fillText(HELP[i],pos[0],pos[1]+20*i)
        }

        //draw the compass and the score
        if(GTIME>8)
        {
            var f=SATURATE(PPOWER/2)
            S3D(sqr,TRS(0,[1+f,-3,0],0,[f,0.1,0],DM))
            S3D(sqr,TRS(0,[PTURB*3+1,-3.3,0],0,[PTURB*3,0.1,0],DM))
            S3D(sqr,TRS(0,[HP+1,-3.6,0],0,[HP,0.1,0],DM))
            DRAWNUM=(v,x,y)=>{for(var i=0;i<4;++i)S3D(glys[((v/POW(10,3-i))|0)%10],TRS(0,[x+i/2,y,0],0,.2,DM),1)}
            DRAWNUM(SCORE,-2.4,-3.3)
        }

        //draw the GPS in clipped area
        CX.save()
        S3D(sqr,APPLYSCALE(0,gps,[0.9,0.9,0.9]),0,0,1)
        s=ZL[ZOOM]
        //compute the model to render streets in the screen
        var centerT=SMAT4(M4(),1/s).MULT(RMAT4(M4(),-PYAW,UP).MULT(TMAT4(M4(),[(-PPOS[0]),0,-(PPOS[2])])))
        var gpsM=TRS(0,Z3,[PI/2,0,0],1,gps)
        gpsM=gpsM.MULT(centerT)
        if(!ZOOM){gpsM=0;PSIZE=-8}
        if(GTIME>5)
            L3D(roads,gpsM,1)
        P3D(HOSPs,gpsM)
        COLOR(1);
        //draw blinking dot for target
        var tpos=TARGETS.filter((a)=>!a.incopter&&a.mode).map((t)=>{
            return t.time<100?t.pos:t.pos2
            //var d=t.pos2.SUB(PPOSXZ),n=NORM(V3(),d),l=LEN(d),m=ZL[ZOOM]*.8
            //return l>m?n.SCALE(m).ADD(PPOSXZ):t.pos2
        })
        if(tpos[0]&&((NOW*10)|0)%2==0)
            P3D(tpos,gpsM)
        ALPHA(.5)
        TARGETS.forEach((t)=>{if(!t.incopter&&t.mode)S3D(circleY,TRS(0,t.pos2,0,10,gpsM),1,1)})
        PSIZE=40
        CX.restore()
        //draw center dot for player
        COLOR(6,1)
        if(GTIME>3)
            S3D(sqr,TRS(0,Z3,0,.03,gps))

        //CX.save();
        //S3D(sqr,TRS(0,[1.9,-.6,0],0,.5,DM),0,0,1)
        lvel=RMAT4(M4(),-PYAW,[0,1,0]).MULT(PVEL)
        S3D(sqr,TRS(0,[1.9+CLAMP(lvel[0]/1.5,-.5,.5),-.6-CLAMP(lvel[2]/1.5,-.5,.5),0],0,.02,DM))
        S3D(sqr,TRS(0,[1.45,-.6+CLAMP(PVEL[1],-.5,.5),0],0,[-.05,.02,0],DM))

        //draw the ALIVE meter
        M=TRS(0,[2,-2,0],0,.5,DM)
        if(PERSON){
            pulse=[];
            var beat=POW(CLAMP(PERSON.time/100,0,1),.4)
            for(var i=0;i<40;++i)
                pulse.p(V3([i/20-1,CLAMP((SIN(i/5+NOW)*SIN(i/2+NOW*4))*beat,-.8,.8),0]));
            S3D(pulse,M,1)
        }
        //lives
        for(var i=0;i<LIVES;++i)
            ALRT.p([1.2,i/4-2.4,0])
        //draw alert dots
        P3D(ALRT,DM,1,1)

        //central dot
        COLOR(2)
        S3D(sqr,M,1,1)
    }

    /*DEBUG
    COLOR(1)
    CX.font="20px Tahoma";
    CX.fillText("Blocks "+NBLOCKS,10,30)
    CX.fillText("Dots "+NDOTS,10,50)
    CX.fillText("Targets "+TARGETS.length,10,70)
    */

    if(READY&&GTIME<20)
    {
        COLOR(6,2-GTIME/10)
        CX.font="16px Arial";CX.textAlign="left"
        CX.fillText(HELP_KEYS,10,20)
    }

    if(ACX) //update audio
    {
        var t=ACX.currentTime,v=0;TALERT-=dt,copter=ACHANNELS[0],radio=ACHANNELS[1],turbo=ACHANNELS[2]
        copter.filter.frequency.linearRampToValueAtTime(PPOWER*300+1000*SHK,t+.1)
        AT+=dt*PFORCE*10+RANDOM()*SHK*10
        v=(FRACT(AT)*.4)+SHK*.2
        copter.gain.gain.linearRampToValueAtTime(CLAMP(v,0,1),t+.1)

        var note=TALERT>0?ASEQS[ASEQI][((NOW*10)|0)%ASEQS[ASEQI].length]:0
        var freq=POW(2,(note-69)/12)*440
        radio.osc.frequency.linearRampToValueAtTime(freq,t+.1)
        radio.gain.gain.value=0.5

        turbo.filter.frequency.linearRampToValueAtTime(PTURB*500+4000,t+.1)
        turbo.gain.gain.linearRampToValueAtTime(PTURB,t+.1)
        //AVOL.gain.value=document.hidden?0:0.5
    }

        //if dead, no update
    if(!LIVES)
    {
        if(ACX){ACX.close(),ACX=0}
        return
    }

    /* UPDATE ***********************/

    SPD=LEN(PVEL)
    //if hit the floor
    if(PPOS[1]<0)
    {
        //if too fast, reduce HP
        if(SPD>0.1||ABS(PFRONT[1])<-.5){
            HP=MAX(0,HP-(0.05+SPD/2));
            SHK=SPD*4
        }
        //reset player model position
        TRS(PM,V3([PPOS[0],0,PPOS[2]]),[0,PYAW,0],1)
        PVEL.fill(0)
    }
    //no more HP, dead
    if(HP<=0)
        LIVES=0
    
    //compute user input
    angz=0
    if(GTIME>6)
    {
        if(KEYS["W"])PPOWER+=dt*.2
        if(KEYS["S"])PPOWER-=dt*.2
        if(KEYS["A"])angz-=dt/3
        if(KEYS["D"])angz+=dt/3
        if(KEYS["Space"])PTURB=SATURATE(PTURB+dt*2)
    }
    if(KEYS["Q"])
        look=LERP(look,-1,.1);else if(KEYS["E"])look=LERP(look,1,.1);else look=LERP(look,0,.1)
    KEYSP={}

    //compute player rotations based on input
    var RM=M4(PM);RM.set(Z3,12)
    //compute forces applied to copter
    PPOWER=CLAMP(PPOWER,0,2)
    PFORCE=LERP(PFORCE,PPOWER+PTURB*3,0.2),
    PFUEL=MAX(0,PFUEL-(PPOWER+PTURB*100)*dt*.001),PTURB*=.9
    f=RM.MULT([0,dt*dt*PFORCE*(PFUEL?25:0),0])//engine
    ADD(PVEL,PVEL,V3([0,-(24+LOADED+PPOS[1]*.5)*dt*dt,0]).ADD(f))//gravity
    SCALE(PVEL,PVEL,0.995)//friction
    if(PPOS[1]<=0)//reset velocity when hitting ground
        PVEL[1]=MAX(0,PVEL[1])
    //apply rotations and translations based on input and forces
    t=TMAT4(M4(),PVEL.SCALE(0.2)),rx=RMAT4(M4(),-CDX*0.15,[0,1,0]),rz=RMAT4(M4(),CDX*0.1+angz,[0,0,-1]),ry=RMAT4(M4(),CDY*0.05,[1,0,0])
    r=MULTMAT4(M4(),rx,ry)
    MULTMAT4(r,rz,r)
    if(PPOS[1]>0)
        MULTMAT4(PM,PM,r)
    MULTMAT4(PM,t,PM)

    //if landed near the target and not loaded yet
    if(NTARGET&&NTARGET.dist<1.5&&PPOS[1]<=0&&LOADED<1){
        LOADED+=dt/2;
        if(LOADED>=1)//remove first
        {
            NTARGET.incopter=1
            PERSON=NTARGET
            TARGETS.shift()
            ASEQI=2;TALERT=0.8
        }
    }

    //update targets state
    TARGETS.forEach((trg)=>{
        trg.time-=dt
        if(RANDOM()>0.001&&!trg.mode){trg.mode=1;TALERT=.8;ASEQI=0}//reported
        if(trg.time<=0){//dead
            LIVES--
            if(NTIME<0)NTIME=10
            if(trg==PERSON){LOADED=PERSON=0;}
            TALERT=.8;ASEQI=3
        }
    })
    TARGETS=TARGETS.filter((t)=>{return t.time>0}) //remove dead

    //if no target and no loaded, chances are to spawn a new target
    if(TARGETS.length<4&&roads[0]&&NTIME<0)
    {
        var r=(RAND(lastR/2)|0)*2,p=LERPV3(V3(),roads[r],roads[r+1],RND()),p2=p.ADD([(RANDOM()-.5)*16,0,(RANDOM()-.5)*16])
        TARGETS.p({pos:p,pos2:p2,time:200+RAND(50),mode:0,incopter:0})//mode:reported
        NTIME=30
    }

    //check if near hospital
    INH=0
    for(var i=0;i<HOSPs.length;++i)
        INH|=DIST(PPOS,HOSPs[i])<2
    //if landed near hospital
    if(PPOS[1]<=0&&INH)
    {
        //check to remove patient
        if(LOADED>=1&&PERSON){
            SCORE+=(PERSON.time/2)|0;
            PERSON=LOADED=0
            TALERT=ASEQI=1
        }
        //refuel
        PFUEL=MIN(1,PFUEL+dt/20)
    }
}

loop();

ONKEY=(e)=>{
    if(e.type=="keydown")
    switch(e.code)
    {
        case "KeyI":YAXIS*=-1;break;
        case "KeyL":Q=!Q;break;
        case "KeyF":ZOOM=(ZOOM+1)%5;break;
    }
}
//</script>