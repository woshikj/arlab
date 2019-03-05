var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var markerRoot1;
var fader;

var textList = [];
var textAppeared = false;
var hasTapped = false;

var shapeList = [];

function SpawnShape(gotoCam)
{
	let geometry = new THREE.SphereGeometry(Math.random() * 0.1 + 0.05, 32, 32);
	
	let material = new THREE.MeshStandardMaterial({
		color: Math.random() * 0x555555 + 0xaaaaaa,
		roughness: 0.5,
		metalness: 0.5
	});
	
	let mesh = new THREE.Mesh( geometry, material );
	mesh.position.x = markerRoot1.position.x + Math.random() * 2 - 1;
	mesh.position.y = markerRoot1.position.y + Math.random() * 2 - 1;
	mesh.position.z = markerRoot1.position.z;
	mesh.velocity = {x:Math.random() * 2 - 1,y:Math.random() * 1.5 + 0.5,z:Math.random() * 0.9 + 0.1};
	var length = Math.sqrt(mesh.velocity.x * mesh.velocity.x + mesh.velocity.y * mesh.velocity.y + mesh.velocity.z * mesh.velocity.z);
	mesh.velocity.x /= length;
	mesh.velocity.y /= length;
	mesh.velocity.z /= length;
	mesh.gotoCam = (gotoCam != null);
	shapeList.push(mesh);
	scene.add(mesh);

	if(gotoCam)
	{
		var scale = {x:1,y:1,z:1};
		new TWEEN.Tween(scale)
		.to({x:2.0, y:2.0, z:2.0}, 2000)
		.easing(TWEEN.Easing.Elastic.Out)
		.onUpdate(function()
		{
			mesh.scale.x = scale.x;
			mesh.scale.y = scale.y;
			mesh.scale.z = scale.z;
		})
		.start();

		var pos = {x:mesh.position.x,y:mesh.position.y,z:mesh.position.z};
		new TWEEN.Tween(pos)
		.to({x:camera.position.x,y:camera.position.y,z:camera.position.z}, 1000)
		.onUpdate(function()
		{
			mesh.position.x = pos.x;
			mesh.position.y = pos.y;
			mesh.position.z = pos.z;
		})
		.start();

		{
			var opacity = {value:0.0};
			new TWEEN.Tween(opacity)
					.to({value:1.0},500)
					.delay(400)
					.onUpdate(function()
					{
						fader.style.opacity = opacity.value;
					})
					.onComplete(function()
					{
						cancelAnimationFrame(animate);
						renderer.domElement.addEventListener('dblclick', null, false);
						
						renderer.dispose();

						markerControls1 = null;
						renderer = null;
						scene = null;
						projector = null;
						camera = null;
						
						init2D();
					})
					.start();
		}
	}
}

function init()
{
    scene = new THREE.Scene();

    let ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
	scene.add(ambientLight);
	
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
	scene.add( directionalLight );

    camera = new THREE.Camera();
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setClearColor(new THREE.Color('lightgrey'), 0);
    renderer.setSize(640,480);
    renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild( renderer.domElement );

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

	clock = new THREE.Clock();
	deltaTime = 0;
	totalTime = 0;
	
	////////////////////////////////////////////////////////////
	// setup arToolkitSource
	////////////////////////////////////////////////////////////

	arToolkitSource = new THREEx.ArToolkitSource({
		sourceType : 'webcam',
	});

	function onResize()
	{
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)	
		if ( arToolkitContext.arController !== null )
		{
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
		}	
	}

	arToolkitSource.init(function onReady(){
		onResize()
	});
	
	// handle resize event
	window.addEventListener('resize', function(){
		onResize()
	});
	
	////////////////////////////////////////////////////////////
	// setup arToolkitContext
	////////////////////////////////////////////////////////////	

	// create atToolkitContext
	arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: 'data/camera_para.dat',
		detectionMode: 'mono'
	});
	
	// copy projection matrix to camera when initialization complete
	arToolkitContext.init( function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
	});

	////////////////////////////////////////////////////////////
	// setup markerRoots
	////////////////////////////////////////////////////////////

	// build markerControls
	markerRoot1 = new THREE.Group();
	scene.add(markerRoot1);
	let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
		type: 'pattern', patternUrl: "data/pattern-marker.patt",
	});

	markerControls1.addEventListener('markerFound', function()
	{
		if(!textAppeared)
		{
			textAppeared = true;
			for(var i = 0; i < textList.length; ++i)
			{
				(function(id)
				{
					let scale = {x:0,y:0,z:0};
					new TWEEN.Tween(scale)
							.to({x:1.0, y:1.0, z:1.0}, 2000)
							.easing(TWEEN.Easing.Elastic.Out)
							.onUpdate(function()
							{
								textList[id].scale.x = scale.x;
								textList[id].scale.y = scale.y;
								textList[id].scale.z = scale.z;
							})
							.start();
				})(i);
			}

			for(var i = 0; i < 20; ++i)
			{
			}
		}
		SpawnShape();
	});

	let loader = new THREE.FontLoader();
	loader.load('fonts/Alien Robot_Regular.json', function (font)
	{
		{
			let geometry = new THREE.TextGeometry('X Reality Lab',
			{
				font: font,
				size: 0.75,
				height: 0.3,
				curveSegments:12
			});
			/*let material	= new THREE.MeshNormalMaterial({
				transparent: true,
				opacity: 1.0,
				side: THREE.DoubleSide
			}); */
			let material = new THREE.MeshStandardMaterial({
				color: 0x42bff4,
				roughness: 0.5,
				metalness: 0.5
			});
			
			let mesh = new THREE.Mesh( geometry, material );
			mesh.position.z = -1.15;
			mesh.position.x = -2.5;
			mesh.rotation.x = Math.PI * 0.5;
			mesh.rotation.y = Math.PI;
			mesh.rotation.z = Math.PI;
			mesh.scale.x = 0;
			mesh.scale.y = 0;
			mesh.scale.z = 0;

			directionalLight.target = mesh;

			textList.push(mesh);
			
			markerRoot1.add( mesh );
		}
		{
			let geometry = new THREE.TextGeometry('Coming Soon!',
			{
				font: font,
				size: 0.5,
				height: 0.3,
				curveSegments:12
			});
			/*let material	= new THREE.MeshNormalMaterial({
				transparent: true,
				opacity: 1.0,
				side: THREE.DoubleSide
			}); */
			let material = new THREE.MeshStandardMaterial({
				color: 0xffffff,
				roughness: 0.5,
				metalness: 0.5
			});
			
			let mesh = new THREE.Mesh( geometry, material );
			mesh.position.z = 0;
			mesh.position.x = -1.85;
			mesh.rotation.x = Math.PI * 0.5;
			mesh.rotation.y = Math.PI;
			mesh.rotation.z = Math.PI;

			textList.push(mesh);
			
			markerRoot1.add( mesh );
		}
		{
			let geometry = new THREE.TextGeometry('SgIC Level 2',
			{
				font: font,
				size: 0.5,
				height: 0.3,
				curveSegments:12
			});
			/*let material	= new THREE.MeshNormalMaterial({
				transparent: true,
				opacity: 1.0,
				side: THREE.DoubleSide
			}); */
			let material = new THREE.MeshStandardMaterial({
				color: 0x42bff4,
				roughness: 0.5,
				metalness: 0.5
			});
			
			let mesh = new THREE.Mesh( geometry, material );
			mesh.position.z = 1;
			mesh.position.x = -1.85;
			mesh.rotation.x = Math.PI * 0.5;
			mesh.rotation.y = Math.PI;
			mesh.rotation.z = Math.PI;

			textList.push(mesh);
			
			markerRoot1.add( mesh );
		}
	});

	document.ontouchstart = function()
	{
		if(textAppeared)
		{
			if(!hasTapped)
				SpawnShape(true);
			hasTapped = true;
		}
	}
}

function update()
{
	// update artoolkit on every frame
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );

	for(var i = 0; i < shapeList.length; ++i)
	{
		if(shapeList[i].position.y < -10)
		{
			scene.remove(shapeList[i]);
			shapeList[i].geometry.dispose();
			shapeList[i].material.dispose();
			shapeList.splice(i,1);
			--i;
			continue;
		}
		if(shapeList[i].gotoCam)
		{
			continue;
		}
		shapeList[i].position.x = shapeList[i].position.x + shapeList[i].velocity.x * 0.5;
		shapeList[i].position.y = shapeList[i].position.y + shapeList[i].velocity.y * 0.5;
		shapeList[i].position.z = shapeList[i].position.z + shapeList[i].velocity.z * 0.5;
		shapeList[i].velocity.y -= 0.981 * 0.1;
	}
}


function render()
{
	renderer.render( scene, camera );
}


function animate()
{
	if(!renderer)
	{
		return;
	}
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();
	render();
	TWEEN.update();
}

//init();
//animate();
init2D();