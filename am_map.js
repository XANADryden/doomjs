//"use strict";

//AutoMap module

if(typeof am_map == "undefined")globalThis.am_map={};

//temporary until we can find a better solution
class Void(){
  contructor(){
    this.type="void"
  }
}

//am_map.h

if(typeof __AMMAP_H__ == "undefined"){
  const __AMMAP_H__ = "random value that means it's defined, but has no other meaning";

  // Used by ST StatusBar stuff.
  const AM_MSGHEADER = (('a'<<24)+('m'<<16));
  const AM_MSGENTERED = (AM_MSGHEADER | ('e'<<8))
  const AM_MSGEXITED = (AM_MSGHEADER | ('x'<<8))
  
  
  // Called by main loop.
  //boolean AM_Responder (event_t* ev);
  
  // Called by main loop.
  const AM_Ticker = (new Void());
  
  // Called by main loop,
  // called instead of view drawer if automap active.
  const AM_Drawer = (new Void());
  
  // Called to force the automap to quit
  // if the level is completed while it is up.
  const AM_Stop = (new Void());
}

//am_map.c
const
REDS        = (256-5*16),
REDRANGE    = 16,
BLUES	    = (256-4*16+8),
BLUERANGE   = 8,
GREENS	    = (7*16),
GREENRANGE  = 16,
GRAYS	    = (6*16),
GRAYSRANGE  = 16,
BROWNS	    = (4*16),
BROWNRANGE  = 16,
YELLOWS	    = (256-32+7),
YELLOWRANGE = 1,
BLACK	    = 0,
WHITE	    = (256-47);

// Automap colors
const
BACKGROUND	 = BLACK,
YOURCOLORS	 = WHITE,
YOURRANGE	 = 0,
WALLCOLORS	 = REDS,
WALLRANGE	 = REDRANGE,
TSWALLCOLORS	 = GRAYS,
TSWALLRANGE	 = GRAYSRANGE,
FDWALLCOLORS	 = BROWNS,
FDWALLRANGE	 = BROWNRANGE,
CDWALLCOLORS	 = YELLOWS,
CDWALLRANGE	 = YELLOWRANGE,
THINGCOLORS	 = GREENS,
THINGRANGE	 = GREENRANGE,
SECRETWALLCOLORS = WALLCOLORS,
SECRETWALLRANGE  = WALLRANGE,
GRIDCOLORS	 = (GRAYS + GRAYSRANGE/2),
GRIDRANGE	 = 0,
XHAIRCOLORS	 = GRAYS;

// drawing stuff
const FB = 0;

const
AM_PANDOWNKEY	= KEY_DOWNARROW,
AM_PANUPKEY	= KEY_UPARROW,
AM_PANRIGHTKEY  = KEY_RIGHTARROW,
AM_PANLEFTKEY	= KEY_LEFTARROW,
AM_ZOOMINKEY	= '=',
AM_ZOOMOUTKEY	= '-',
AM_STARTKEY	= KEY_TAB,
AM_ENDKEY	= KEY_TAB,
AM_GOBIGKEY	= '0',
AM_FOLLOWKEY	= 'f',
AM_GRIDKEY	= 'g',
AM_MARKKEY	= 'm',
AM_CLEARMARKKEY	= 'c';

const AM_NUMMARKPOINTS = 10;

// scale on entry
const INITSCALEMTOF = (.2*FRACUNIT);//i dont actually know if #define a (b+c) is const a = () => (b+c) or if it's const a=b+c
// how much the automap moves window per tic in frame-buffer coordinates
// moves 140 pixels in 1 second
const F_PANINC = 4;
// how much zoom-in per tic
// goes to 2x in 1 second
const M_ZOOMIN = (Math.floor(1.02*FRACUNIT));
// how much zoom-out per tic
// pulls out to 0.5x in 1 second
const M_ZOOMOUT = (Math.floor(FRACUNIT/1.02));

// translates between frame-buffer and map distances
const
FTOM = (x) => FixedMul((x)<<16,scale_ftom),
MTOF = (x) => FixedMul((x),scale_mtof)>>16;
// translates between frame-buffer and map coordinates
const
CXMTOF = (x) => (f_x + MTOF((x)-m_x)),
CYMTOF = (y) => (f_y + (f_h - MTOF((y)-m_y)));

// the following is crap
const LINE_NEVERSEE = ML_DONTDRAW;

//var fpoint_t = {x,y,set x(a){if(a > -2,147,483,648 && a > 2,147,483,647){this.x = a;}else{throw(new Error("Wrong Type!"))}},set y(a){if(a > -2,147,483,648 && a > 2,147,483,647){this.x = a;}else{throw(new Error("Wrong Type!"))}}};
class fpoint_t {
  constructor(x, y) {
    
    if(typeof x != "number" && x.type != "int") throw(new Error("Wrong Type!"));
    if(!(x < -2,147,483,648 || x > 2,147,483,647)){
      this.x = x
    }else{ throw(new Error("New Value Exceeds Bounds!")) }
    
    if(typeof y != "number" && y.type != "int") throw(new Error("Wrong Type!"));
    if(!(y < -2,147,483,648 || y > 2,147,483,647)){
      this.y = y
    }else{ throw(new Error("New Value Exceeds Bounds!")) }
    
    this.type = "fpoint_t";
  }
  
  set x(a) {
    if(typeof a != "number" && a.type != "int") throw(new Error("Wrong Type!"));
    if(!(a < -2,147,483,648 || a > 2,147,483,647)){
      this.x = a;
    }else{ throw(new Error("New Value Exceeds Bounds!")) }
  }
  
  set y(a) {
    if(typeof a != "number" && a.type != "int") throw(new Error("Wrong Type!"));
    if(!(a < -2,147,483,648 || a > 2,147,483,647)){
      this.y = a;
    }else{ throw(new Error("New Value Exceeds Bounds!")) }
  }
}

class fline_t {
  constructor(a, b) {
    
    if(a.type != "fpoint_t") throw(new Error("Wrong Type!"));
    this.a = a;
    
    if(b.type != "fpoint_t") throw(new Error("Wrong Type!"));
    this.b = b;
    
    this.type = "fline_t"
  }
  
  set a(n) {
    if(n.type != "fpoint_t") throw(new Error("Wrong Type!"));
    this.a = n;
  }
  
  set b(n) {
    if(n.type != "fpoint_t") throw(new Error("Wrong Type!"));
    this.b = n
  }
}

class mpoint_t {
  constructor(x, y) {
    
    if(x.type == "fixed_t") { this.x = x } else { this.x = new fixed_t(x) }
    
    if(y.type == "fixed_t") { this.y = y } else { this.y = new fixed_t(y) }
    
    this.type = "mpoint_t"
  }
  
  set x(n) {
    if(n.type == "fixed_t") { this.x = n } else { this.x = new fixed_t(n) }
  }
  
  set y(n) {
    if(n.type == "fixed_t") { this.y = n } else { this.y = new fixed_t(n) }
  }
}

class mline_t {
  constructor(a, b) {
    
    if(a.type != "mpoint_t") throw(new Error("Wrong Type!"));
    this.a = a;
    
    if(b.type != "mpoint_t") throw(new Error("Wrong Type!"));
    this.b = b;
    
    this.type = "mline_t"
  }
  
  set a(n) {
    if(n.type != "mpoint_t") throw(new Error("Wrong Type!"));
    this.a = n;
  }
  
  set b(n) {
    if(n.type != "mpoint_t") throw(new Error("Wrong Type!"));
    this.b = n
  }
}

class islope_t {
  constructor(slp, islp) {
    
    if(slp.type != "fixed_t") throw(new Error("Wrong Type!"));
    this.slp = slp;
    
    if(islp.type != "fixed_t") throw(new Error("Wrong Type!"));
    this.islp = islp;
    
    this.type = "islope_t"
  }
  
  set slp(n) {
    if(n.type != "fixed_t") throw(new Error("Wrong Type!"));
    this.slp = n;
  }
  
  set islp(n) {
    if(n.type != "fixed_t") throw(new Error("Wrong Type!"));
    this.islp = n
  }
}



//
// The vector graphics for the automap.
//  A line drawing of the player pointing right,
//   starting from the middle.
//

let R = ((8*PLAYERRADIUS)/7);
var player_arrow = [
  	new mline_t( new mpoint_t(-R+R/8, 0), new mpoint_t(R, 0) ), // -----
  	new mline_t( new mpoint_t(R, 0), new mpoint_t(R-R/2, R/4) ),  // ----->
  	new mline_t( new mpoint_t(R, 0), new mpoint_t(R-R/2, -R/4) ),
  	new mline_t( new mpoint_t(-R+R/8, 0), new mpoint_t(-R-R/8, R/4) ), // >---->
  	new mline_t( new mpoint_t(-R+R/8, 0), new mpoint_t(-R-R/8, -R/4) ),
  	new mline_t( new mpoint_t(-R+3*R/8, 0), new mpoint_t(-R+R/8, R/4) ), // >>--->
  	new mline_t( new mpoint_t(-R+3*R/8, 0), new mpoint_t(-R+R/8, -R/4) )
];
	
/*mline_t player_arrow[] = {
    { { -R+R/8, 0 }, { R, 0 } }, // -----
    { { R, 0 }, { R-R/2, R/4 } },  // ----->
    { { R, 0 }, { R-R/2, -R/4 } },
    { { -R+R/8, 0 }, { -R-R/8, R/4 } }, // >---->
    { { -R+R/8, 0 }, { -R-R/8, -R/4 } },
    { { -R+3*R/8, 0 }, { -R+R/8, R/4 } }, // >>--->
    { { -R+3*R/8, 0 }, { -R+R/8, -R/4 } }
};*/

const NUMPLYRLINES = (sizeof(player_arrow)/sizeof(mline_t));//WE ARE SCREWED!!!  .length != sizeof()   In fact, sizeof has no JS equevalent.  PLS HELP.  We need an estimate on the size of player_arrow and mline_t as they are in C.


R = ((8*PLAYERRADIUS)/7);
var cheat_player_arrow = [
    new mline_t( new mpoint_t( -R+R/8, 0 ), new mpoint_t( R, 0 ) ), // -----
    new mline_t( new mpoint_t( R, 0 ), new mpoint_t( R-R/2, R/6 ) ),  // ----->
    new mline_t( new mpoint_t( R, 0 ), new mpoint_t( R-R/2, -R/6 ) ),
    new mline_t( new mpoint_t( -R+R/8, 0 ), new mpoint_t( -R-R/8, R/6 ) ), // >----->
    new mline_t( new mpoint_t( -R+R/8, 0 ), new mpoint_t( -R-R/8, -R/6 ) ),
    new mline_t( new mpoint_t( -R+3*R/8, 0 ), new mpoint_t( -R+R/8, R/6 ) ), // >>----->
    new mline_t( new mpoint_t( -R+3*R/8, 0 ), new mpoint_t( -R+R/8, -R/6 ) ),
    new mline_t( new mpoint_t( -R/2, 0 ), new mpoint_t( -R/2, -R/6 ) ), // >>-d--->
    new mline_t( new mpoint_t( -R/2, -R/6 ), new mpoint_t( -R/2+R/6, -R/6 ) ),
   	new mline_t( new mpoint_t( -R/2+R/6, -R/6 ), new mpoint_t( -R/2+R/6, R/4 ) ),
    new mline_t( new mpoint_t( -R/6, 0 ), new mpoint_t( -R/6, -R/6 ) ), // >>-dd-->
    new mline_t( new mpoint_t( -R/6, -R/6 ), new mpoint_t( 0, -R/6 ) ),
    new mline_t( new mpoint_t( 0, -R/6 ), new mpoint_t( 0, R/4 ) ),
    new mline_t( new mpoint_t( R/6, R/4 ), new mpoint_t( R/6, -R/7 ) ), // >>-ddt->
    new mline_t( new mpoint_t( R/6, -R/7 ), new mpoint_t( R/6+R/32, -R/7-R/32 ) ),
    new mline_t( new mpoint_t( R/6+R/32, -R/7-R/32 ), new mpoint_t( R/6+R/10, -R/7 ) )
];
//:::CONTINUE:::
const NUMCHEATPLYRLINES = (sizeof(cheat_player_arrow)/sizeof(mline_t));

R = (FRACUNIT);
var triangle_guy = [
    new mline_t( new mpoint_t( -.867*R, -.5*R ), new mpoint_t( .867*R, -.5*R ) ),
    new mline_t( new mpoint_t( .867*R, -.5*R ) , new mpoint_t( 0, R ) ),
    new mline_t( new mpoint_t( 0, R ), new mpoint_t( -.867*R, -.5*R ) )
];
const NUMTRIANGLEGUYLINES = (sizeof(triangle_guy)/sizeof(mline_t));

R = (FRACUNIT);
var thintriangle_guy = [
    new mline_t( new mpoint_t( -.5*R, -.7*R ), new mpoint_t( R, 0 ) ),
    new mline_t( new mpoint_t( R, 0 ), new mpoint_t( -.5*R, .7*R ) ),
    new mline_t( new mpoint_t( -.5*R, .7*R ), new mpoint_t( -.5*R, -.7*R ) )
];
const NUMTHINTRIANGLEGUYLINES = (sizeof(thintriangle_guy)/sizeof(mline_t));



//static int
am_map. 	cheating = 0;
am_map. 	grid = 0;

am_map. 	leveljuststarted = 1; 	// kluge until AM_LevelInit() is called

var    	automapactive = false;
am_map. 	finit_width = SCREENWIDTH;               //static int
am_map.		finit_height = SCREENHEIGHT - 32;

// location of window on screen
am_map. 	f_x;
am_map.		f_y;

// size of window on screen
am_map. 	f_w;
am_map.		f_h;

am_map. 	lightlev; 		// used for funky strobing effect
am_map.		fb = c_native.byte(); 	// pseudo-frame buffer   //static byte pointer
am_map. 	amclock;		//static int


am_map.		m_paninc; // how far the window pans each tic (map coords)             //mpoint_t
am_map.		mtof_zoommul; // how far the window zooms in each tic (map coords)     // fixed_t 	
am_map.		ftom_zoommul; // how far the window zooms in each tic (fb coords)

am_map. 	m_x; am_map.m_y;   // LL x,y where the window is on the map (map coords)
am_map.		m_x2; am_map.m_y2; // UR x,y where the window is on the map (map coords)

//
// width/height of window on map (map coords)
//
am_map. 	m_w;       //static fixed_t
am_map.		m_h;

// based on level size
am_map. 	min_x;
am_map.		min_y; 
am_map. 	max_x;
am_map.		max_y;

am_map. 	max_w; // max_x-min_x,
am_map.		max_h; // max_y-min_y

// based on player size
am_map. 	min_w;
am_map.   min_h;


am_map. 	min_scale_mtof; // used to tell when to stop zooming out
am_map. 	max_scale_mtof; // used to tell when to stop zooming in

// old stuff for recovery later
am_map. old_m_w;am_map. old_m_h;
am_map. old_m_x;am_map. old_m_y;

// old location used by the Follower routine
am_map. f_oldloc;      //static mpoint_t

// used by MTOF to scale from map-to-frame-buffer coords
am_map. scale_mtof = INITSCALEMTOF;             //static fixed_t
// used by FTOM to scale from frame-buffer-to-map coords (=1/scale_mtof)
am_map. scale_ftom;

//static player_t *plr
am_map. plr=new player_t(); // the player represented by an arrow

//static patch_t *marknums[10];
am_map. marknums=[]; // numbers used for marking by the automap
am_map. markpoints=[]; // where the points are      mpoint_t [AM_NUMMARKPOINTS]
for(var c = 0; c<AM_NUMMARKPOINTS; c++){
	am_map.markpoints.push();
}
am_map. markpointnum = 0; // next point to be assigned                   //int

am_map. followplayer = 1; // specifies whether to follow the player around

am_map. cheat_amap_seq = [ 0xb2, 0x26, 0x26, 0x2e, 0xff ];    //unsigned char
am_map. cheat_amap = [ cheat_amap_seq, 0 ];							//cheatseeq_t

am_map. stopped = true;                 //static boolean

globalThis. viewactive = false;              //extern boolean
//extern byte screens[][SCREENWIDTH*SCREENHEIGHT];



void
V_MarkRect
( int	x,
  int	y,
  int	width,
  int	height );

// Calculates the slope and slope according to the x-axis of a line
// segment in map coordinates (with the upright y-axis n' all) so
// that it can be used with the brain-dead drawing stuff.


//mline_t* ml, islope_t* is
function AM_getIslope( ml, is )
{
		
    var dx, dy; //int

    dy = ml.a.y - ml.b.y;
    dx = ml.b.x - ml.a.x;
    is.islp = dy ? FixedDiv(dx, dy) : (dx < 0 ? -MAXINT : MAXINT);
    is.slp = dx ? FixedDiv(dy, dx) : (dy < 0 ? -MAXINT : MAXINT);
	
}

//
//
//
function AM_activateNewScale()
{
    am_map.m_x += am_map.m_w/2;
    am_map.m_y += am_map.m_h/2;
    am_map.m_w = FTOM(am_map.f_w);
    am_map.m_h = FTOM(am_map.f_h);
    am_map.m_x -= am_map.m_w/2;
    am_map.m_y -= am_map.m_h/2;
    am_map.m_x2 = am_map.m_x + am_map.m_w;
    am_map.m_y2 = am_map.m_y + am_map.m_h;
}

//
//
//
function AM_saveScaleAndLoc()
{
    am_map.old_m_x = am_map.m_x;
    am_map.old_m_y = am_map.m_y;
    am_map.old_m_w = am_map.m_w;
    am_map.old_m_h = am_map.m_h;
}

//
//
//
function AM_restoreScaleAndLoc()
{

    am_map.m_w = am_map.old_m_w;
    am_map.m_h = am_map.old_m_h;
    if (!am_map.followplayer)
    {
		am_map.m_x = am_map.old_m_x;
		am_map.m_y = am_map.old_m_y;
    } else {
		am_map.m_x = am_map.plr.mo.x - am_map.m_w/2;
		am_map.m_y = am_map.plr.mo.y - am_map.m_h/2;
    }
    am_map.m_x2 = am_map.m_x + am_map.m_w;
    am_map.m_y2 = am_map.m_y + am_map.m_h;

    // Change the scaling multipliers
    am_map.scale_mtof = FixedDiv(am_map.f_w<<FRACBITS, am_map.m_w);
    am_map.scale_ftom = FixedDiv(FRACUNIT, am_map.scale_mtof);
}

//
// adds a marker at the current location
//
function AM_addMark()
{
    am_map.markpoints[am_map.markpointnum].x = am_map.m_x + am_map.m_w/2;
    am_map.markpoints[am_map.markpointnum].y = am_map.m_y + am_map.m_h/2;
    am_map.markpointnum = (am_map.markpointnum + 1) % AM_NUMMARKPOINTS;

}

//
// Determines bounding box of all vertices,
// sets global variables controlling zoom range.
//
function AM_findMinMaxBoundaries()
{
    var i;
	//fixed_t
    var a;
    var b;

    am_map.min_x = am_map.min_y =  MAXINT;
    am_map.max_x = am_map.max_y = -MAXINT;
  
    for (i=0;i<am_map.numvertexes;i++)
    {
	if (vertexes[i].x < am_map.min_x)
	    am_map.min_x = vertexes[i].x;
	else if (vertexes[i].x > am_map.max_x)
	    am_map.max_x = vertexes[i].x;
    
	if (vertexes[i].y < am_map.min_y)
	    am_map.min_y = vertexes[i].y;
	else if (vertexes[i].y > am_map.max_y)
	    am_map.max_y = vertexes[i].y;
    }
  
    am_map.max_w = am_map.max_x - am_map.min_x;
    am_map.max_h = am_map.max_y - am_map.min_y;

    am_map.min_w = 2*PLAYERRADIUS; // const? never changed?
    am_map.min_h = 2*PLAYERRADIUS;

    a = FixedDiv(am_map.f_w<<FRACBITS, am_map.max_w);
    b = FixedDiv(am_map.f_h<<FRACBITS, am_map.max_h);
  
    am_map.min_scale_mtof = a < b ? a : b;
    am_map.max_scale_mtof = FixedDiv(am_map.f_h<<FRACBITS, 2*PLAYERRADIUS);

}


//
//
//
function AM_changeWindowLoc()
{
    if (am_map.m_paninc.x || am_map.m_paninc.y)
    {
	am_map.followplayer = 0;
	am_map.f_oldloc.x = MAXINT;
    }

    am_map.m_x += am_map.m_paninc.x;
    am_map.m_y += am_map.m_paninc.y;

    if (am_map.m_x + am_map.m_w/2 > am_map.max_x)
		am_map.m_x = am_map.max_x - am_map.m_w/2;
    else if (am_map.m_x + am_map.m_w/2 < am_map.min_x)
		am_map.m_x = am_map.min_x - am_map.m_w/2;
  
    if (am_map.m_y + am_map.m_h/2 > am_map.max_y)
		am_map.m_y = am_map.max_y - am_map.m_h/2;
    else if (am_map.m_y + am_map.m_h/2 < am_map.min_y)
		am_map.m_y = am_map.min_y - am_map.m_h/2;

    am_map.m_x2 = am_map.m_x + am_map.m_w;
    am_map.m_y2 = am_map.m_y + am_map.m_h;
}


//
//
//
function AM_initVariables()
{
    var pnum;   //int
    am_map. st_notify = new event_t ([ ev_keyup, AM_MSGENTERED ]);    //static event_t st_notify

    am_map. automapactive = true;
    am_map. fb = screens[0];

    am_map.f_oldloc.x = MAXINT;
    am_map.amclock = 0;
    lightlev = 0;

    am_map.m_paninc.x = am_map.m_paninc.y = 0;
    am_map.ftom_zoommul = FRACUNIT;
    am_map.mtof_zoommul = FRACUNIT;

    am_map.m_w = FTOM(am_map.f_w);
    am_map.m_h = FTOM(am_map.f_h);

    // find player to center on initially
    if (!playeringame[pnum = consoleplayer])
	for (pnum=0;pnum<MAXPLAYERS;pnum++)
	    if (playeringame[pnum])
		break;
  
    am_map.plr = players[pnum];
    am_map.m_x = am_map.plr.mo.x - am_map.m_w/2;
    am_map.m_y = am_map.plr.mo.y - am_map.m_h/2;
    AM_changeWindowLoc();

    // for saving & restoring
    am_map.old_m_x = am_map.m_x;
    am_map.old_m_y = am_map.m_y;
    am_map.old_m_w = am_map.m_w;
    am_map.old_m_h = am_map.m_h;

    // inform the status bar of the change
    ST_Responder(am_map.st_notify);

}

//
// 
//
function AM_loadPics()
{
    var i;   //int
    var namebuf=[];  //char [9]
  
    for (i=0;i<10;i++)
    {
	sprintf(namebuf, "AMMNUM%d", i);
	am_map.marknums[i] = W_CacheLumpName(namebuf, PU_STATIC);
    }

}

function AM_unloadPics()
{
    var i;   //int
  
    for (i=0;i<10;i++){
	Z_ChangeTag(am_map.marknums[i], PU_CACHE);
	}

}

function AM_clearMarks()
{
    var i;

    for (i=0;i<AM_NUMMARKPOINTS;i++)
	am_map.markpoints[i].x = -1; // means empty
    am_map.markpointnum = 0;
}

//
// should be called at the start of every level
// right now, i figure it out myself
//
function AM_LevelInit()
{
    leveljuststarted = 0;

    am_map.f_x = am_map.f_y = 0;
    am_map.f_w = finit_width;
    am_map.f_h = finit_height;

    AM_clearMarks();

    AM_findMinMaxBoundaries();
    am_map.scale_mtof = FixedDiv(am_map.min_scale_mtof, Math.floor(0.7*FRACUNIT));
    if (am_map.scale_mtof > am_map.max_scale_mtof)
	am_map.scale_mtof = am_map.min_scale_mtof;
    am_map.scale_ftom = FixedDiv(FRACUNIT, am_map.scale_mtof);
}




//
//
//
function AM_Stop ()
{
    am_map.st_notify = new event_t([ 0, ev_keyup, AM_MSGEXITED ]);  //static event_t st_notify 

    AM_unloadPics();
    am_map.automapactive = false;
    ST_Responder(am_map.st_notify);
    am_map.stopped = true;
}

//
//:::CONTINUE:::
//
void AM_Start (void)
{
    static int lastlevel = -1, lastepisode = -1;

    if (!stopped) AM_Stop();
    stopped = false;
    if (lastlevel != gamemap || lastepisode != gameepisode)
    {
	AM_LevelInit();
	lastlevel = gamemap;
	lastepisode = gameepisode;
    }
    AM_initVariables();
    AM_loadPics();
}

//
// set the window scale to the maximum size
//
void AM_minOutWindowScale(void)
{
    scale_mtof = min_scale_mtof;
    scale_ftom = FixedDiv(FRACUNIT, scale_mtof);
    AM_activateNewScale();
}

//
// set the window scale to the minimum size
//
void AM_maxOutWindowScale(void)
{
    scale_mtof = max_scale_mtof;
    scale_ftom = FixedDiv(FRACUNIT, scale_mtof);
    AM_activateNewScale();
}


//
// Handle events (user inputs) in automap mode
//
boolean
AM_Responder
( event_t*	ev )
{

    int rc;
    static int cheatstate=0;
    static int bigstate=0;
    static char buffer[20];

    rc = false;

    if (!automapactive)
    {
	if (ev->type == ev_keydown && ev->data1 == AM_STARTKEY)
	{
	    AM_Start ();
	    viewactive = false;
	    rc = true;
	}
    }

    else if (ev->type == ev_keydown)
    {

	rc = true;
	switch(ev->data1)
	{
	  case AM_PANRIGHTKEY: // pan right
	    if (!followplayer) m_paninc.x = FTOM(F_PANINC);
	    else rc = false;
	    break;
	  case AM_PANLEFTKEY: // pan left
	    if (!followplayer) m_paninc.x = -FTOM(F_PANINC);
	    else rc = false;
	    break;
	  case AM_PANUPKEY: // pan up
	    if (!followplayer) m_paninc.y = FTOM(F_PANINC);
	    else rc = false;
	    break;
	  case AM_PANDOWNKEY: // pan down
	    if (!followplayer) m_paninc.y = -FTOM(F_PANINC);
	    else rc = false;
	    break;
	  case AM_ZOOMOUTKEY: // zoom out
	    mtof_zoommul = M_ZOOMOUT;
	    ftom_zoommul = M_ZOOMIN;
	    break;
	  case AM_ZOOMINKEY: // zoom in
	    mtof_zoommul = M_ZOOMIN;
	    ftom_zoommul = M_ZOOMOUT;
	    break;
	  case AM_ENDKEY:
	    bigstate = 0;
	    viewactive = true;
	    AM_Stop ();
	    break;
	  case AM_GOBIGKEY:
	    bigstate = !bigstate;
	    if (bigstate)
	    {
		AM_saveScaleAndLoc();
		AM_minOutWindowScale();
	    }
	    else AM_restoreScaleAndLoc();
	    break;
	  case AM_FOLLOWKEY:
	    followplayer = !followplayer;
	    f_oldloc.x = MAXINT;
	    plr->message = followplayer ? AMSTR_FOLLOWON : AMSTR_FOLLOWOFF;
	    break;
	  case AM_GRIDKEY:
	    grid = !grid;
	    plr->message = grid ? AMSTR_GRIDON : AMSTR_GRIDOFF;
	    break;
	  case AM_MARKKEY:
	    sprintf(buffer, "%s %d", AMSTR_MARKEDSPOT, markpointnum);
	    plr->message = buffer;
	    AM_addMark();
	    break;
	  case AM_CLEARMARKKEY:
	    AM_clearMarks();
	    plr->message = AMSTR_MARKSCLEARED;
	    break;
	  default:
	    cheatstate=0;
	    rc = false;
	}
	if (!deathmatch && cht_CheckCheat(&cheat_amap, ev->data1))
	{
	    rc = false;
	    cheating = (cheating+1) % 3;
	}
    }

    else if (ev->type == ev_keyup)
    {
	rc = false;
	switch (ev->data1)
	{
	  case AM_PANRIGHTKEY:
	    if (!followplayer) m_paninc.x = 0;
	    break;
	  case AM_PANLEFTKEY:
	    if (!followplayer) m_paninc.x = 0;
	    break;
	  case AM_PANUPKEY:
	    if (!followplayer) m_paninc.y = 0;
	    break;
	  case AM_PANDOWNKEY:
	    if (!followplayer) m_paninc.y = 0;
	    break;
	  case AM_ZOOMOUTKEY:
	  case AM_ZOOMINKEY:
	    mtof_zoommul = FRACUNIT;
	    ftom_zoommul = FRACUNIT;
	    break;
	}
    }

    return rc;

}


//
// Zooming
//
void AM_changeWindowScale(void)
{

    // Change the scaling multipliers
    scale_mtof = FixedMul(scale_mtof, mtof_zoommul);
    scale_ftom = FixedDiv(FRACUNIT, scale_mtof);

    if (scale_mtof < min_scale_mtof)
	AM_minOutWindowScale();
    else if (scale_mtof > max_scale_mtof)
	AM_maxOutWindowScale();
    else
	AM_activateNewScale();
}


//
//
//
void AM_doFollowPlayer(void)
{

    if (f_oldloc.x != plr->mo->x || f_oldloc.y != plr->mo->y)
    {
	m_x = FTOM(MTOF(plr->mo->x)) - m_w/2;
	m_y = FTOM(MTOF(plr->mo->y)) - m_h/2;
	m_x2 = m_x + m_w;
	m_y2 = m_y + m_h;
	f_oldloc.x = plr->mo->x;
	f_oldloc.y = plr->mo->y;

	//  m_x = FTOM(MTOF(plr->mo->x - m_w/2));
	//  m_y = FTOM(MTOF(plr->mo->y - m_h/2));
	//  m_x = plr->mo->x - m_w/2;
	//  m_y = plr->mo->y - m_h/2;

    }

}

//
//
//
void AM_updateLightLev(void)
{
    static nexttic = 0;
    //static int litelevels[] = { 0, 3, 5, 6, 6, 7, 7, 7 };
    static int litelevels[] = { 0, 4, 7, 10, 12, 14, 15, 15 };
    static int litelevelscnt = 0;
   
    // Change light level
    if (amclock>nexttic)
    {
	lightlev = litelevels[litelevelscnt++];
	if (litelevelscnt == sizeof(litelevels)/sizeof(int)) litelevelscnt = 0;
	nexttic = amclock + 6 - (amclock % 6);
    }

}


//
// Updates on Game Tick
//
void AM_Ticker (void)
{

    if (!automapactive)
	return;

    amclock++;

    if (followplayer)
	AM_doFollowPlayer();

    // Change the zoom if necessary
    if (ftom_zoommul != FRACUNIT)
	AM_changeWindowScale();

    // Change x,y location
    if (m_paninc.x || m_paninc.y)
	AM_changeWindowLoc();

    // Update light level
    // AM_updateLightLev();

}


//
// Clear automap frame buffer.
//
void AM_clearFB(int color)
{
    memset(fb, color, f_w*f_h);
}


//
// Automap clipping of lines.
//
// Based on Cohen-Sutherland clipping algorithm but with a slightly
// faster reject and precalculated slopes.  If the speed is needed,
// use a hash algorithm to handle  the common cases.
//
boolean
AM_clipMline
( mline_t*	ml,
  fline_t*	fl )
{
    enum
    {
	LEFT	=1,
	RIGHT	=2,
	BOTTOM	=4,
	TOP	=8
    };
    
    register	outcode1 = 0;
    register	outcode2 = 0;
    register	outside;
    
    fpoint_t	tmp;
    int		dx;
    int		dy;

    
#define DOOUTCODE(oc, mx, my) \
    (oc) = 0; \
    if ((my) < 0) (oc) |= TOP; \
    else if ((my) >= f_h) (oc) |= BOTTOM; \
    if ((mx) < 0) (oc) |= LEFT; \
    else if ((mx) >= f_w) (oc) |= RIGHT;

    
    // do trivial rejects and outcodes
    if (ml->a.y > m_y2)
	outcode1 = TOP;
    else if (ml->a.y < m_y)
	outcode1 = BOTTOM;

    if (ml->b.y > m_y2)
	outcode2 = TOP;
    else if (ml->b.y < m_y)
	outcode2 = BOTTOM;
    
    if (outcode1 & outcode2)
	return false; // trivially outside

    if (ml->a.x < m_x)
	outcode1 |= LEFT;
    else if (ml->a.x > m_x2)
	outcode1 |= RIGHT;
    
    if (ml->b.x < m_x)
	outcode2 |= LEFT;
    else if (ml->b.x > m_x2)
	outcode2 |= RIGHT;
    
    if (outcode1 & outcode2)
	return false; // trivially outside

    // transform to frame-buffer coordinates.
    fl->a.x = CXMTOF(ml->a.x);
    fl->a.y = CYMTOF(ml->a.y);
    fl->b.x = CXMTOF(ml->b.x);
    fl->b.y = CYMTOF(ml->b.y);

    DOOUTCODE(outcode1, fl->a.x, fl->a.y);
    DOOUTCODE(outcode2, fl->b.x, fl->b.y);

    if (outcode1 & outcode2)
	return false;

    while (outcode1 | outcode2)
    {
	// may be partially inside box
	// find an outside point
	if (outcode1)
	    outside = outcode1;
	else
	    outside = outcode2;
	
	// clip to each side
	if (outside & TOP)
	{
	    dy = fl->a.y - fl->b.y;
	    dx = fl->b.x - fl->a.x;
	    tmp.x = fl->a.x + (dx*(fl->a.y))/dy;
	    tmp.y = 0;
	}
	else if (outside & BOTTOM)
	{
	    dy = fl->a.y - fl->b.y;
	    dx = fl->b.x - fl->a.x;
	    tmp.x = fl->a.x + (dx*(fl->a.y-f_h))/dy;
	    tmp.y = f_h-1;
	}
	else if (outside & RIGHT)
	{
	    dy = fl->b.y - fl->a.y;
	    dx = fl->b.x - fl->a.x;
	    tmp.y = fl->a.y + (dy*(f_w-1 - fl->a.x))/dx;
	    tmp.x = f_w-1;
	}
	else if (outside & LEFT)
	{
	    dy = fl->b.y - fl->a.y;
	    dx = fl->b.x - fl->a.x;
	    tmp.y = fl->a.y + (dy*(-fl->a.x))/dx;
	    tmp.x = 0;
	}

	if (outside == outcode1)
	{
	    fl->a = tmp;
	    DOOUTCODE(outcode1, fl->a.x, fl->a.y);
	}
	else
	{
	    fl->b = tmp;
	    DOOUTCODE(outcode2, fl->b.x, fl->b.y);
	}
	
	if (outcode1 & outcode2)
	    return false; // trivially outside
    }

    return true;
}
#undef DOOUTCODE


//
// Classic Bresenham w/ whatever optimizations needed for speed
//
void
AM_drawFline
( fline_t*	fl,
  int		color )
{
    register int x;
    register int y;
    register int dx;
    register int dy;
    register int sx;
    register int sy;
    register int ax;
    register int ay;
    register int d;
    
    static fuck = 0;

    // For debugging only
    if (      fl->a.x < 0 || fl->a.x >= f_w
	   || fl->a.y < 0 || fl->a.y >= f_h
	   || fl->b.x < 0 || fl->b.x >= f_w
	   || fl->b.y < 0 || fl->b.y >= f_h)
    {
	fprintf(stderr, "fuck %d \r", fuck++);
	return;
    }

#define PUTDOT(xx,yy,cc) fb[(yy)*f_w+(xx)]=(cc)

    dx = fl->b.x - fl->a.x;
    ax = 2 * (dx<0 ? -dx : dx);
    sx = dx<0 ? -1 : 1;

    dy = fl->b.y - fl->a.y;
    ay = 2 * (dy<0 ? -dy : dy);
    sy = dy<0 ? -1 : 1;

    x = fl->a.x;
    y = fl->a.y;

    if (ax > ay)
    {
	d = ay - ax/2;
	while (1)
	{
	    PUTDOT(x,y,color);
	    if (x == fl->b.x) return;
	    if (d>=0)
	    {
		y += sy;
		d -= ax;
	    }
	    x += sx;
	    d += ay;
	}
    }
    else
    {
	d = ax - ay/2;
	while (1)
	{
	    PUTDOT(x, y, color);
	    if (y == fl->b.y) return;
	    if (d >= 0)
	    {
		x += sx;
		d -= ay;
	    }
	    y += sy;
	    d += ax;
	}
    }
}


//
// Clip lines, draw visible part sof lines.
//
void
AM_drawMline
( mline_t*	ml,
  int		color )
{
    static fline_t fl;

    if (AM_clipMline(ml, &fl))
	AM_drawFline(&fl, color); // draws it on frame buffer using fb coords
}



//
// Draws flat (floor/ceiling tile) aligned grid lines.
//
void AM_drawGrid(int color)
{
    fixed_t x, y;
    fixed_t start, end;
    mline_t ml;

    // Figure out start of vertical gridlines
    start = m_x;
    if ((start-bmaporgx)%(MAPBLOCKUNITS<<FRACBITS))
	start += (MAPBLOCKUNITS<<FRACBITS)
	    - ((start-bmaporgx)%(MAPBLOCKUNITS<<FRACBITS));
    end = m_x + m_w;

    // draw vertical gridlines
    ml.a.y = m_y;
    ml.b.y = m_y+m_h;
    for (x=start; x<end; x+=(MAPBLOCKUNITS<<FRACBITS))
    {
	ml.a.x = x;
	ml.b.x = x;
	AM_drawMline(&ml, color);
    }

    // Figure out start of horizontal gridlines
    start = m_y;
    if ((start-bmaporgy)%(MAPBLOCKUNITS<<FRACBITS))
	start += (MAPBLOCKUNITS<<FRACBITS)
	    - ((start-bmaporgy)%(MAPBLOCKUNITS<<FRACBITS));
    end = m_y + m_h;

    // draw horizontal gridlines
    ml.a.x = m_x;
    ml.b.x = m_x + m_w;
    for (y=start; y<end; y+=(MAPBLOCKUNITS<<FRACBITS))
    {
	ml.a.y = y;
	ml.b.y = y;
	AM_drawMline(&ml, color);
    }

}

//
// Determines visible lines, draws them.
// This is LineDef based, not LineSeg based.
//
void AM_drawWalls(void)
{
    int i;
    static mline_t l;

    for (i=0;i<numlines;i++)
    {
	l.a.x = lines[i].v1->x;
	l.a.y = lines[i].v1->y;
	l.b.x = lines[i].v2->x;
	l.b.y = lines[i].v2->y;
	if (cheating || (lines[i].flags & ML_MAPPED))
	{
	    if ((lines[i].flags & LINE_NEVERSEE) && !cheating)
		continue;
	    if (!lines[i].backsector)
	    {
		AM_drawMline(&l, WALLCOLORS+lightlev);
	    }
	    else
	    {
		if (lines[i].special == 39)
		{ // teleporters
		    AM_drawMline(&l, WALLCOLORS+WALLRANGE/2);
		}
		else if (lines[i].flags & ML_SECRET) // secret door
		{
		    if (cheating) AM_drawMline(&l, SECRETWALLCOLORS + lightlev);
		    else AM_drawMline(&l, WALLCOLORS+lightlev);
		}
		else if (lines[i].backsector->floorheight
			   != lines[i].frontsector->floorheight) {
		    AM_drawMline(&l, FDWALLCOLORS + lightlev); // floor level change
		}
		else if (lines[i].backsector->ceilingheight
			   != lines[i].frontsector->ceilingheight) {
		    AM_drawMline(&l, CDWALLCOLORS+lightlev); // ceiling level change
		}
		else if (cheating) {
		    AM_drawMline(&l, TSWALLCOLORS+lightlev);
		}
	    }
	}
	else if (plr->powers[pw_allmap])
	{
	    if (!(lines[i].flags & LINE_NEVERSEE)) AM_drawMline(&l, GRAYS+3);
	}
    }
}


//
// Rotation in 2D.
// Used to rotate player arrow line character.
//
void
AM_rotate
( fixed_t*	x,
  fixed_t*	y,
  angle_t	a )
{
    fixed_t tmpx;

    tmpx =
	FixedMul(*x,finecosine[a>>ANGLETOFINESHIFT])
	- FixedMul(*y,finesine[a>>ANGLETOFINESHIFT]);
    
    *y   =
	FixedMul(*x,finesine[a>>ANGLETOFINESHIFT])
	+ FixedMul(*y,finecosine[a>>ANGLETOFINESHIFT]);

    *x = tmpx;
}

void
AM_drawLineCharacter
( mline_t*	lineguy,
  int		lineguylines,
  fixed_t	scale,
  angle_t	angle,
  int		color,
  fixed_t	x,
  fixed_t	y )
{
    int		i;
    mline_t	l;

    for (i=0;i<lineguylines;i++)
    {
	l.a.x = lineguy[i].a.x;
	l.a.y = lineguy[i].a.y;

	if (scale)
	{
	    l.a.x = FixedMul(scale, l.a.x);
	    l.a.y = FixedMul(scale, l.a.y);
	}

	if (angle)
	    AM_rotate(&l.a.x, &l.a.y, angle);

	l.a.x += x;
	l.a.y += y;

	l.b.x = lineguy[i].b.x;
	l.b.y = lineguy[i].b.y;

	if (scale)
	{
	    l.b.x = FixedMul(scale, l.b.x);
	    l.b.y = FixedMul(scale, l.b.y);
	}

	if (angle)
	    AM_rotate(&l.b.x, &l.b.y, angle);
	
	l.b.x += x;
	l.b.y += y;

	AM_drawMline(&l, color);
    }
}

void AM_drawPlayers(void)
{
    int		i;
    player_t*	p;
    static int 	their_colors[] = { GREENS, GRAYS, BROWNS, REDS };
    int		their_color = -1;
    int		color;

    if (!netgame)
    {
	if (cheating)
	    AM_drawLineCharacter
		(cheat_player_arrow, NUMCHEATPLYRLINES, 0,
		 plr->mo->angle, WHITE, plr->mo->x, plr->mo->y);
	else
	    AM_drawLineCharacter
		(player_arrow, NUMPLYRLINES, 0, plr->mo->angle,
		 WHITE, plr->mo->x, plr->mo->y);
	return;
    }

    for (i=0;i<MAXPLAYERS;i++)
    {
	their_color++;
	p = &players[i];

	if ( (deathmatch && !singledemo) && p != plr)
	    continue;

	if (!playeringame[i])
	    continue;

	if (p->powers[pw_invisibility])
	    color = 246; // *close* to black
	else
	    color = their_colors[their_color];
	
	AM_drawLineCharacter
	    (player_arrow, NUMPLYRLINES, 0, p->mo->angle,
	     color, p->mo->x, p->mo->y);
    }

}

void
AM_drawThings
( int	colors,
  int 	colorrange)
{
    int		i;
    mobj_t*	t;

    for (i=0;i<numsectors;i++)
    {
	t = sectors[i].thinglist;
	while (t)
	{
	    AM_drawLineCharacter
		(thintriangle_guy, NUMTHINTRIANGLEGUYLINES,
		 16<<FRACBITS, t->angle, colors+lightlev, t->x, t->y);
	    t = t->snext;
	}
    }
}

void AM_drawMarks(void)
{
    int i, fx, fy, w, h;

    for (i=0;i<AM_NUMMARKPOINTS;i++)
    {
	if (markpoints[i].x != -1)
	{
	    //      w = SHORT(marknums[i]->width);
	    //      h = SHORT(marknums[i]->height);
	    w = 5; // because something's wrong with the wad, i guess
	    h = 6; // because something's wrong with the wad, i guess
	    fx = CXMTOF(markpoints[i].x);
	    fy = CYMTOF(markpoints[i].y);
	    if (fx >= f_x && fx <= f_w - w && fy >= f_y && fy <= f_h - h)
		V_DrawPatch(fx, fy, FB, marknums[i]);
	}
    }

}

void AM_drawCrosshair(int color)
{
    fb[(f_w*(f_h+1))/2] = color; // single point for now

}

void AM_Drawer (void)
{
    if (!automapactive) return;

    AM_clearFB(BACKGROUND);
    if (grid)
	AM_drawGrid(GRIDCOLORS);
    AM_drawWalls();
    AM_drawPlayers();
    if (cheating==2)
	AM_drawThings(THINGCOLORS, THINGRANGE);
    AM_drawCrosshair(XHAIRCOLORS);

    AM_drawMarks();

    V_MarkRect(f_x, f_y, f_w, f_h);

}
