import Hero from "../components/Hero";
import LatestMusic from "../components/LatestMusic";
import LatestVideos from "../components/LatestVideos";

const Home = () => {
  return (
    <>
      <Hero />
      <LatestMusic />
      <LatestVideos />
      <div id="footer" className="min-h-[40vh] px-6 py-16 md:px-10" />
    </>
  );
};

export default Home;
