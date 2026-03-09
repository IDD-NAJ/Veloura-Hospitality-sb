const DestVisual = ({ name, w = "100%", h = "100%" }) => {
  const key = (name || "").toLowerCase().replace(/\s/g, "");
  const images = {
    paris: {
      src: "/src/images/paris.jpg",
      alt: "Paris luxury hotel with Eiffel Tower view",
      gradient: "linear-gradient(135deg, rgba(26,51,82,0.4) 0%, rgba(42,90,138,0.3) 50%, rgba(15,25,35,0.5) 100%)"
    },
    santorini: {
      src: "/src/images/santorini.jpg", 
      alt: "Santorini cliffside hotel with caldera view",
      gradient: "linear-gradient(135deg, rgba(13,42,58,0.4) 0%, rgba(26,74,107,0.3) 50%, rgba(30,80,120,0.5) 100%)"
    },
    tokyo: {
      src: "/src/images/tokyo.jpg",
      alt: "Tokyo luxury hotel with city skyline view",
      gradient: "linear-gradient(135deg, rgba(26,10,6,0.4) 0%, rgba(74,26,10,0.3) 50%, rgba(40,20,10,0.5) 100%)"
    }
  };
  
  const imageConfig = images[key] || images.paris;
  
  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden" }}>
      <img 
        src={imageConfig.src} 
        alt={imageConfig.alt}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center"
        }}
      />
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: imageConfig.gradient
        }}
      />
    </div>
  );
};

export default DestVisual;
