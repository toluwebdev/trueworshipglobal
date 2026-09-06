import Hero from "../components/Hero";
import LatestMusic from "../components/LatestMusic";
import LatestVideos from "../components/LatestVideos";
import UpcomingEvents from "../components/UpcomingEvents";

const Home = () => {
  return (
    <>
      <UpcomingEvents />
      <Hero />
      <LatestMusic />
      <LatestVideos />
    </>
  );
};

export default Home;
