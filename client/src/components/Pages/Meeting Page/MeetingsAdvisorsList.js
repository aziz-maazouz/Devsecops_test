import React from "react";
import AdvisorCard from "../../Team/AdvisorCard";
import fetchService from "../../../services/fetchService";
import Footer from "../Footer";
import Carousel from "react-material-ui-carousel";
import Loading from "../../Loading";
import { StyledButton } from "../../Basic Elements/StyledBasicElements";
import { Typography, useMediaQuery } from "@mui/material";

function MeetingsAdvisorsList() {
  React.useEffect(() => {
    document.title = "Meetings - Advisors - Student Specialty Advisor";
    getAdvisorsList();
  }, []);
  const [advisors, setAdvisors] = React.useState([]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const getAdvisorsList = async () => {
    const json = await fetchService.doGET("meeting/advisors");
    setAdvisors(json);
    setIsLoaded(true);
  };
  const isMobile = useMediaQuery("(max-width:1080px)", { noSsr: true });

  const mappingFunction = (advisor) => {
    return (
      <AdvisorCard
        key={advisor._id}
        fullname={advisor.fullName}
        picture={advisor.imageUrl}
        profession={advisor.profession}
        specialty={advisor.specialty}
        quote={advisor.quote}
        email={advisor.email}
        linkedin={advisor.linkedinUrl}
        isMobile={isMobile}
      />
    );
  };

  return (
    <>
      <div className="about-container-header">
        <h1>Meet the Team!</h1>
        <h4>Get the guidance you need from friends and familiar faces</h4>
      </div>
      {isLoaded ? (
        <>
          {advisors.length !== 0 ? (
            <Carousel
              height={isMobile ? 420 : 360}
              navButtonsAlwaysInvisible={true}
              className="advisors-carousel"
              a
            >
              {advisors.map(mappingFunction)}
            </Carousel>
          ) : (
            <Typography
              fontSize="1.1rem"
              textAlign="center"
              marginTop={isMobile ? "200px" : "50px"}
            >
              We are still looking for advisors!
            </Typography>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: isMobile && "120px",
            }}
          >
            <p>
              <strong>Want to be the change?</strong>
            </p>
            <StyledButton
              size="large"
              variant="contained"
              onClick={() => {
                window.open("https://forms.gle/ontbQo6ypicRPUb3A", "blank");
              }}
            >
              Become an advisor
            </StyledButton>
          </div>
        </>
      ) : (
        <Loading
          overrideStyle={{
            marginTop: isMobile ? "40vh" : "50px",
            marginBottom: !isMobile && "50px",
          }}
        />
      )}
      {!isMobile && <Footer />}
    </>
  );
}

export default MeetingsAdvisorsList;
