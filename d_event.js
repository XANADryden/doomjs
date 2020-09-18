//d_event.h


// Emacs style mode select   -*- C++ -*- 
//-----------------------------------------------------------------------------
//
// $Id:$
//
// Copyright (C) 1993-1996 by id Software, Inc.
//
// This source is available for distribution and/or modification
// only under the terms of the DOOM Source Code License as
// published by id Software. All rights reserved.
//
// The source is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// FITNESS FOR A PARTICULAR PURPOSE. See the DOOM Source Code License
// for more details.
//
// DESCRIPTION:
//
//    
//-----------------------------------------------------------------------------

if(!__D_EVENT__){
__D_EVENT__={};


//#include "doomtype.h"


//
// Event handling.
//

// Input event types
__D_EVENT__.evtype_t = Object.freeze({type:"evtype_t", class:"enum", ev_keydown:0, ev_keyup:1, ev_mouse:2, ev_joystick:3});
/*typedef enum
{
    ev_keydown,
    ev_keyup,
    ev_mouse,
    ev_joystick
} evtype_t;*/
//Object.assign({},)
    
// Event structure.
//datas are ints
__D_EVENT__.event_t = {etype:"event_t", class:"struct", type:0, data1:0, data2:0, data3:0, set type(a){if(a.type=="evtype_t")this.type=a}};

/*typedef struct
{
    evtype_t	type;
    int		data1;		// keys / mouse/joystick buttons
    int		data2;		// mouse/joystick x move
    int		data3;		// mouse/joystick y move
} event_t;*/

__D_EVENT__.gameaction_t = Object.freeze({ga_nothing:0,ga_loadlevel:1,ga_newgame:2,ga_loadgame:3,ga_savegame:4,ga_playdemo:5,ga_completed:6,ga_victory:7,ga_worlddone:8,ga_screenshot:9})
/*typedef enum
{
    ga_nothing,
    ga_loadlevel,
    ga_newgame,
    ga_loadgame,
    ga_savegame,
    ga_playdemo,
    ga_completed,
    ga_victory,
    ga_worlddone,
    ga_screenshot
} gameaction_t;*/



//
// Button/action code definitions.
//
    //Object.assign({},)

__D_EVENT__.buttoncode_t=Object.freeze(
{
    // Press "Fire".
    BT_ATTACK		: 1,
    // Use button, to open doors, activate switches.
    BT_USE		: 2,

    // Flag: game events, not really buttons.
    BT_SPECIAL		: 128,
    BT_SPECIALMASK	: 3,
    
    // Flag, weapon change pending.
    // If true, the next 3 bits hold weapon num.
    BT_CHANGE		: 4,
    // The 3bit weapon mask and shift, convenience.
    BT_WEAPONMASK	: (8+16+32),
    BT_WEAPONSHIFT	: 3,

    // Pause the game.
    BTS_PAUSE		: 1,
    // Save the game at each console.
    BTS_SAVEGAME	: 2,

    // Savegame slot numbers
    //  occupy the second byte of buttons.    
    BTS_SAVEMASK	: (4+8+16),
    BTS_SAVESHIFT 	: 2,
  
});




//
// GLOBAL VARIABLES
//
__D_EVENT__.MAXEVENTS	=	64;

    //extern event_t events[MAXEVENTS];
globalThis.  events=[];
    for(var c = 0; c<__D_EVENT__.MAXEVENTS; c++){
        events.push(Object.assign({},__D_EVENT__.event_t));
    }
globalThis.eventhead=0;
globalThis.eventtail=0;

globalThis.gameaction = Object.assign({},__D_EVENT__.gameaction_t);


}

//-----------------------------------------------------------------------------
//
// $Log:$
//
//-----------------------------------------------------------------------------
