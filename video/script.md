# SCRIPT

Hi, my name is Javi, and in this video I will guide you through the process of creating my entry for the JS13K 2022 Compo.

The goal of the compo: to create a videogame during one month than runs on the browser and which size cannot exceed 13 kilobytes.
For those of you not familiar with how much 13KBs is, it is the equivalen size of a tiny image or 10 pages of a book.

Here you can see 13KBs, every character is one byte, so our limit es 13.000 of them.

[13kbs]

In that space we must fit all, quite a challenge.

# The Challenge

Working under constrains is always a funny excercise, it forces you to be more creative and to stay away from your familiar places.

For this challenge I wanted to force myself to create a 3D game, and I was well aware of the complexities of this endevour.

A full 3D engine in less than 13KBs is tricky, I risk that after all the code for the 3D rendering there is not much space left for the gameplay / level design / art and audio.

Instead of showing you the game and explaining how it was done, I would guide you through every step of my creative process, so you will undertand better the end result.

# The first step

To create a game in the browser there are three paths:
- Creating a game using HTML (more suited for text games)
- Creating a game using the Canvas2D element (it gives you more control to draw on the screen)
- Creating a game using WebGL (it gives you access to the GPU which opens up lots of possibilities)

For a 3D game the choice is obvious, WebGL. But using WebGL requires lots of code, besides the common mathmatics functions for geometric operations, you also need GPU related code like to load meshes, upload geometry to VRAM, shaders, and the rendering pipeline.

All that code will substract space for the gameplay, so I wanted to go in a different route.

See, I said before browsers come with an API called Canvas2D.
Canvas2D allows to draw basic shapes and images with little code. It comes with a nice API for any basic 2D drawing operation.
[Canvas2D]

Let's imagine we want to draw a grid of points.
[Grid]

You just iterate through 



