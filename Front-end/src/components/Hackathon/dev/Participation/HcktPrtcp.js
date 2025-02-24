import React, { useEffect, useState } from "react";
import {
  Banner,
  BlackBtn,
  CheckBox,
  Container,
  SubHeader,
  TextSub,
  WhiteBtn,
} from "../../../Global/GlobalComponents";
import { TextField } from "@mui/material";
import api from "../../../../api/api";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CourseTitle } from "../../../Course/Details/CourseElements";
import { TextWrapper } from "../../../HeroSection/HeroElements";
import { Code, Tabs } from "@mantine/core";
import { renderToString } from "react-dom/server";
import { MdArrowBack } from "react-icons/md";
import { BlurContainer, FinishContainer } from "./styles";
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";

import { Children } from "react";

import { Group, Text, useMantineTheme, rem } from "@mantine/core";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { Input } from "@nextui-org/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { lowlight } from "lowlight";
import tsLanguageSyntax from "highlight.js/lib/languages/typescript";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Image } from "@mantine/core";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import Notebook from "./Notebook";

const HcktPrtcp = ({ user, log }) => {
  const [error, setError] = useState("");
  const [hackathon, setHackathon] = useState({});
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [points, setPoints] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchHackathon = async () => {
    api
      .get(`/hackathons/${id}`)
      .then((res) => {
        if (res.status === 200) {
          setHackathon(res.data);
        }
      })
      .catch((err) => console.log(err));
  };

  console.log(hackathon);

  const handleAnswer = async () => {
    try {
      const data = {
        developerID: user.userID,
        challengeID: hackathon.challengeID,
        input: input,
      };
      const submission = await api.post(
        `/hackathons/submission/${hackathon.challengeID}`,
        data
      );

      console.log(submission);
    } catch (err) {
      console.log(err);
    }
  };

  const addPoints = async () => {
    try {
      const data = {
        devID: user.userID,
        points: hackathon.points,
      };

      const pointsAdded = await api.put(`user/addPoints/${user.userID}`, data);

      console.log(pointsAdded.data);
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleClick = () => {
    const isValid = validateForm();
    if (isValid && timeLeft !== 0) {
      handleAnswer();
      const isCorrect = hackathon.solution === input;
      setIsCorrect(isCorrect);
      if (isCorrect) {
        addPoints();
      }
      setSubmitted(true);
    }
  };

  console.log(input);
  console.log(hackathon.solution);
  console.log(points);
  console.log(isCorrect);

  const handleRedirect = () => {
    navigate("/");
  };

  const validateForm = () => {
    if (!input) {
      setError("Please answer the question before submitting!");
      return false; // Return false to indicate the form is invalid
    }
    if (timeLeft === 0) {
      setError("The hackathon is over, therefore u cannot submit your answer!");
      return false;
    }

    return true; // Return true to indicate the form is valid
  };

  function renderQuestion(question) {
    const html = question;
    const container = document.createElement("div");
    container.innerHTML = html;

    const codeTags = container.querySelectorAll("code");

    codeTags.forEach((codeTag) => {
      const codeText = codeTag.textContent;
      const codeLanguage = codeTag.getAttribute("language");

      const codeComponent = React.createElement(
        Code,
        { language: codeLanguage },
        codeText
      );

      const wrapper = document.createElement("div");
      const renderedCode = renderToString(codeComponent);
      wrapper.innerHTML = renderedCode;

      // Replace the <code> tag with the wrapper div in the container
      codeTag.parentNode.replaceChild(wrapper.firstChild, codeTag);
    });

    // Return the modified HTML string
    return container.innerHTML;
  }

  useEffect(() => {
    fetchHackathon();
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const currentTime = new Date().getTime();
      const endTimeParts = hackathon.end.split(":");
      const targetTime = new Date();
      targetTime.setHours(parseInt(endTimeParts[0], 10));
      targetTime.setMinutes(parseInt(endTimeParts[1], 10));
      targetTime.setSeconds(parseInt(endTimeParts[2], 10));
      const difference = targetTime.getTime() - currentTime;

      if (difference > 0) {
        // Calculate the remaining hours
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        const timeLeftString = `${hours}h ${minutes}m ${seconds}s`;

        setTimeLeft(timeLeftString);
      } else {
        // If the end time has passed, set the remaining hours to 0
        setTimeLeft(0);
      }
    };

    // Update the time left every second
    const timer = setInterval(() => {
      calculateTimeLeft();
    }, 1000);
    // Clean up the timer when the component is unmounted
    return () => clearInterval(timer);
  }, [hackathon.end]);

  lowlight.registerLanguage("ts", tsLanguageSyntax);
  const codeExample =
    escapeHtml(`// Valid braces Kata - https://www.codewars.com/kata/5277c8a221e209d3f6000b56

      const pairs: Record<string, string> = {
        '[': ']',
        '{': '}',
        '(': ')',
      };

      const openBraces = Object.keys(pairs);
 
  `);
  const [editorContent, setEditorContent] = useState(
    `<p>Regular paragraph</p><pre><code>${codeExample}</code></pre>`
  );
  const editor = useEditor({
    extensions: [
      Link,
      Image,
      StarterKit,
      CodeBlockLowlight.configure({
        lowlight,
        Underline,
        Superscript,
        SubScript,
        Highlight,
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: editorContent,
    onUpdate() {
      setEditorContent(editor.getHTML());
    },
  });

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  /* const handleEditorChange = (index, value) => {
    setRichTextValues((prev) =>
      prev.map((v, idx) => (idx === index ? value : v))
    );
  }; */
  return (
    <>
      <Banner color={"black"} style={{ display: "flex" }}>
        <TextWrapper style={{ flex: 1, margin: "45px 99px" }}>
          <CourseTitle
            color={"white"}
            title={`${hackathon.name} Hackathon`}
            style={{ width: "80vw" }}
          />
          <TextSub style={{ color: "white", margin: 0 }}>
            Answer the following question(s) before the time is up. Good luck!
          </TextSub>
          <br />
          <TextSub style={{ color: "white", margin: 0 }}>
            <h3>Time left: {timeLeft}</h3>
          </TextSub>
          <TextSub style={{ color: "white", margin: 0 }}>
            End Time: {hackathon.end}
          </TextSub>
        </TextWrapper>
      </Banner>
      <Container>
        <div style={{ display: "flex" }}>
          <div style={{ marginRight: "25px"}}>
            <h1>Problem</h1>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: "2.4rem",
                padding: "0 30px",
                justifyContent: "space-around",
              }}
              dangerouslySetInnerHTML={{
                __html: renderQuestion(hackathon.question),
              }}
            ></div>
            <h2>Good Luck!</h2>
            <h1>Answer</h1>
            <TextField
              fullWidth
              label="Answer"
              id="bg"
              style={{ margin: "20px" }}
              multiline
              onChange={(e) => setInput(e.target.value)}
              value={input}
              rows={10}
            />
          </div>
          <Notebook hackathon={hackathon} />
        </div>
        {submitted ? (
          <BlurContainer>
            <FinishContainer>
              <SubHeader style={{ textAlign: "center" }}>
                Thank you for participating!
              </SubHeader>
              {/* <TextSub
                style={{
                  color: "black",
                  textAlign: "center",
                  marginTop: "40px",
                }}
              >
                Your results will be posted soon!
              </TextSub> */}
              <br />
              <SubHeader style={{ textAlign: "center", fontSize: "35px" }}>
                Your score is:
                <br />
                {isCorrect ? hackathon.points : 0}
              </SubHeader>
              <CheckBox></CheckBox>
              <WhiteBtn onClick={handleRedirect}>
                <MdArrowBack /> Go back to dashboard
              </WhiteBtn>
            </FinishContainer>
          </BlurContainer>
        ) : (
          <BlackBtn style={{ width: "5%" }} onClick={handleClick}>
            Submit
          </BlackBtn>
        )}
        <div className="errmsg">{error}</div>
      </Container>
    </>
  );
};

export default HcktPrtcp;
