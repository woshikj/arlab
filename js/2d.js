

function init2D()
{
    document.ontouchstart = null;
    document.body.innerHTML = '';

    fader = document.createElement('div');
    fader.id = 'ui-fader';
    document.body.appendChild(fader);

    {
		var opacity = {value:1.0};
		new TWEEN.Tween(opacity)
				.to({value:0.0},1000)
				.delay(2000)
				.onUpdate(function()
				{
					fader.style.opacity = opacity.value;
				})
				.start();
    }
    
    var intv = setInterval(function()
    {
        TWEEN.update();
    },0);

    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        Common = Matter.Common,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Bodies = Matter.Bodies;

    var engine = Engine.create();
    var world = engine.world;

    var winWidth = document.documentElement.clientWidth;
    var winHeight = document.documentElement.clientHeight;

    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            //width: 800,//window.innerWidth,
            //height: 600,//window.innerHeight,
            width: winWidth,
            height: winHeight,
            background: '#ffffff',
            showAngleIndicator: false,
            wireframes: false
        }
    });

    Render.run(render);

    var runner = Runner.create();
    Runner.run(runner, engine);

    var offset = 10,
        options = {
            isStatic: true
        };
    
    world.bodies = [];
    
    var halfWidth = winWidth * 0.5;
    var halfHeight = winHeight * 0.5;

    World.add(world,[
        Bodies.rectangle(halfWidth, -offset, winWidth + 0.5 + 2 * offset, 50.5, options),
        Bodies.rectangle(halfWidth, winHeight + offset, winWidth + 0.5 + 2 * offset, 50.5, options),
        Bodies.rectangle(winWidth + offset, halfHeight, 50.5, winHeight + 0.5 + 2 * offset, options),
        Bodies.rectangle(-offset, halfHeight, 50.5, winHeight + 0.5 + 2 * offset, options)
    ]);

    var stack = Composites.stack(20, 20, 10, 4, 0, 0, function(x, y) {
        //if (Common.random() > 0.35) {
            return Bodies.rectangle(x, halfHeight + y, 64, 64, {
                render: {
                    strokeStyle: '#ffffff',
                    sprite: {
                        texture: './img/box' + (Common.random() > 0.5 ? 0 : 1) + '.png'
                    }
                }
            });
        /*} else {
            return Bodies.circle(x, y, 36.8, {
                density: 0.0005,
                frictionAir: 0.06,
                restitution: 0.3,
                friction: 0.01,
                render: {
                    sprite: {
                        texture: './img/ball' + (Common.random() > 0.5 ? 0 : 1) + '.png'
                    }
                }
            });
        }*/
    });

    let title = Bodies.rectangle(halfWidth, halfHeight * 0.5, 256, 128, {
        render: {
            strokeStyle: '#ffffff',
            sprite: {
                texture: './img/title.png'
            }
        }
    })

    World.add(world, stack);
    World.add(world, title);

    var updateGravity = function(event) {
        var orientation = typeof window.orientation !== 'undefined' ? window.orientation : 0,
            gravity = engine.world.gravity;

        if (orientation === 0) {
            gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
            gravity.y = Common.clamp(event.beta, -90, 90) / 90;
        } else if (orientation === 180) {
            gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
            gravity.y = Common.clamp(-event.beta, -90, 90) / 90;
        } else if (orientation === 90) {
            gravity.x = Common.clamp(event.beta, -90, 90) / 90;
            gravity.y = Common.clamp(-event.gamma, -90, 90) / 90;
        } else if (orientation === -90) {
            gravity.x = Common.clamp(-event.beta, -90, 90) / 90;
            gravity.y = Common.clamp(event.gamma, -90, 90) / 90;
        }
        gravity *= 3.0;
    };

    window.addEventListener('deviceorientation', updateGravity);

    // add mouse control
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    World.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: winWidth, y: winHeight }
    });

    render.canvas.width = winWidth;
    render.canvas.height = winHeight;

    console.log(winWidth + ' | ' + winHeight);
}