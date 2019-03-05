var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var markerRoot1;

var textList = [];
var textAppeared = false;

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
	loader.load('fonts/Forte_Regular.json', function (font)
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

	/*let geometry1	= new THREE.CubeGeometry(1,1,1);
	let material1	= new THREE.MeshNormalMaterial({
		transparent: true,
		opacity: 1.0,
		side: THREE.DoubleSide
	}); 
	
	mesh1 = new THREE.Mesh( geometry1, material1 );
	mesh1.position.y = 0.5;
	mesh1.scale.x = 0.5;
	mesh1.scale.y = 0.5;
	mesh1.scale.z = 0.5;
	
	markerRoot1.add( mesh1 );*/
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
			var dx = camera.position.x - shapeList[i].position.x;
			var dy = camera.position.y - shapeList[i].position.y;
			var dz = camera.position.z - shapeList[i].position.z;
			var length = Math.sqrt(dx*dx + dy*dy + dz*dz);
			dx /= length;
			dy /= length;
			dz /= length;

			shapeList[i].position.x = shapeList[i].position.x + dx * 0.5;
			shapeList[i].position.y = shapeList[i].position.y + dy * 0.5;
			shapeList[i].position.z = shapeList[i].position.z + dz * 0.5;
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
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();
	TWEEN.update();
	render();
}

init();
animate();