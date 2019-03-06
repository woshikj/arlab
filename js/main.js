var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var markerRoot1;
var fader;

var textList = [];
var textAppeared = false;
var hasTapped = false;
var textGroup = null;

var scanText = null;
var addedScanText = true;
var scanTextTimeout = null;

var shapeList = [];

function SpawnShape(gotoCam)
{
	let geometry = new THREE.SphereGeometry(Math.random() * 0.1 + 0.05, 32, 32);
	
	let material = new THREE.MeshStandardMaterial({
		color: Math.random() < 0.5 ? 0xffffff : 0x00a3e0,
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

    let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
	scene.add(ambientLight);
	
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
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
			if(scanText)
			{
				scanTextTimeout = setTimeout(function()
				{
					scanTextTimeout = null;
					scanText.innerHTML = '<span style="position:absolute;left:15%;top:-10%;display:flex;justify-content: center;">Tap to continue</span>';
				},2000);
				scanText.innerHTML = '';
			}
			addedScanText = false;
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
		}
		SpawnShape();
	});

	let loader = new THREE.FontLoader();
	loader.load('fonts/Montserrat_Bold.json', function (font)
	{
		textGroup = new THREE.Group();
		{
			let geometry = new THREE.TextGeometry('X Reality Lab',
			{
				font: font,
				size: 0.3,
				height: 0.2,
				curveSegments:12
			});
			/*let material	= new THREE.MeshNormalMaterial({
				transparent: true,
				opacity: 1.0,
				side: THREE.DoubleSide
			}); */
			let material = new THREE.MeshStandardMaterial({
				color: 0x00a3e0,
				roughness: 0.2,
				metalness: 0.5
			});
			
			let mesh = new THREE.Mesh( geometry, material );
			mesh.position.z = -1.0;
			mesh.position.x = -1.5;
			mesh.scale.x = 0;
			mesh.scale.y = 0;
			mesh.scale.z = 0;

			directionalLight.target = mesh;

			textList.push(mesh);
			
			textGroup.add( mesh );
		}
		{
			let geometry = new THREE.TextGeometry('Coming Soon!',
			{
				font: font,
				size: 0.3,
				height: 0.2,
				curveSegments:12
			});
			/*let material	= new THREE.MeshNormalMaterial({
				transparent: true,
				opacity: 1.0,
				side: THREE.DoubleSide
			}); */
			let material = new THREE.MeshStandardMaterial({
				color: 0xffffff,
				roughness: 0.2,
				metalness: 0.5
			});
			
			let mesh = new THREE.Mesh( geometry, material );
			mesh.position.z = 0;
			mesh.position.x = -1.35;

			textList.push(mesh);
			
			textGroup.add( mesh );
		}
		{
			let geometry = new THREE.TextGeometry('SgIC Level 2',
			{
				font: font,
				size: 0.3,
				height: 0.2,
				curveSegments:12
			});
			/*let material	= new THREE.MeshNormalMaterial({
				transparent: true,
				opacity: 1.0,
				side: THREE.DoubleSide
			}); */
			let material = new THREE.MeshStandardMaterial({
				color: 0x00a3e0,
				roughness: 0.2,
				metalness: 0.5
			});
			
			let mesh = new THREE.Mesh( geometry, material );
			mesh.position.z = 1;
			mesh.position.x = -1.35;

			textList.push(mesh);
			
			textGroup.add( mesh );
		}
		scene.add(textGroup);

		scanText = document.createElement('div');
		scanText.style.top = '80%';
		scanText.style.left = '10%';
		scanText.style.position = 'absolute';
		scanText.style.width = '100%';
		scanText.style.height = '20%';
		scanText.style.fontFamily = 'mont';
		scanText.style.color = '#ffffff';
		scanText.style.fontSize = '6vw';
		scanText.innerHTML = "<img src=\"img/scan_qr.png\" style=\"position:absolute;top:-280%;left:0%;width:80%;\"/>Point Camera to QR Code";

		document.body.appendChild(scanText);
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
	
	textGroup.position.x = markerRoot1.position.x;
	textGroup.position.y = markerRoot1.position.y - 0.25;
	textGroup.position.z = markerRoot1.position.z;
	textGroup.scale.x = markerRoot1.scale.x * 0.35;
	textGroup.scale.y = markerRoot1.scale.y * 0.35;
	textGroup.scale.z = markerRoot1.scale.z * 0.35;
	textGroup.visible = markerRoot1.visible;
	
	for(var i = 0; i < textList.length; ++i)
	{
		textList[i].position.x = 0.1 * (i%2 == 0 ? 1 : 0) - 1.5;
		textList[i].position.y = 1 - i * 0.5 - 0.5;
		textList[i].position.z = i * -0.25;
	}

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
	
	if(markerRoot1 && !markerRoot1.visible)
	{
		if(!addedScanText)
			scanText.innerHTML = "<img src=\"img/scan_qr.png\" style=\"position:absolute;top:-280%;left:0%;width:80%;\"/>Point Camera to QR Code";
		if(scanTextTimeout)
			clearTimeout(scanTextTimeout);
		scanTextTimeout = null;
		addedScanText = true;
		textAppeared = false;
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

var isWeChat = /micromessenger/i.test(navigator.userAgent);

if(isWeChat)
	init2D();
else
{
	init();
	animate();
	//init2D();
}