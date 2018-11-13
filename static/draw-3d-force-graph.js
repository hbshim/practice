//<script src="./three.js"></script>
//<script src="./three-spriteMathtJaxedText.min.js"></script>
//<script src='https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML' async></script>
// <script src="https://unpkg.com/3d-force-graph"></script>
// <script src="../../dist/3d-force-graph.js"></script> 

// <div id="3d-graph"></div>
//<script>
const Graph = ForceGraph3D()
    (document.getElementById('3d-graph'))
    .jsonUrl('/graph')
    .nodeId('uuid')
    .nodeAutoColorBy('labels')
    .nodeRelSize(100)
    .nodeLabel('name') 
    .nodeThreeObject(node => {
        const sprite = new SpriteText(node.name);
        sprite.color = node.color;
        sprite.textHeight = 8;
        return sprite;
    })
    .linkLabel('type')
    .linkAutoColorBy('type')
    .linkOpacity(.5)
    //.linkWidth(1)
    .linkDirectionalParticles(10)
    .linkDirectionalParticleSpeed(0.005);
//
// Spread nodes a little wider
Graph.d3Force('charge').strength(-200);

window.addEventListener("resize", Graph.width(window.innerWidth / 2).height(window.innerHeight));
//</script>