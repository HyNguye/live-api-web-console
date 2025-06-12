/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useEffect, useRef, useState, memo } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import {
  FunctionDeclaration,
  LiveServerToolCall,
  Modality,
  Type,
} from "@google/genai";

const declaration: FunctionDeclaration = {
  name: "render_altair",
  description: "Displays an altair graph in json format.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      json_graph: {
        type: Type.STRING,
        description:
          "JSON STRING representation of the graph to render. Must be a string, not a json object",
      },
    },
    required: ["json_graph"],
  },
};
const dictionary: FunctionDeclaration = {
  name: "dictionary_check",
  description: "Checks meaning of a word in the dictionary.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      word: {
        type: Type.STRING,
        description:
          "The word to check in the dictionary. Must be a string.",
      },
    },
    required: ["word"],
  },
};

function AltairComponent() {
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig, setModel } = useLiveAPIContext();

  useEffect(() => {
    setModel("models/gemini-2.0-flash-exp");
    setConfig({
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
      },
      systemInstruction: {
        parts: [
          {
            text: `You are an expert English conversation tutor. Your task is to engage in interactive conversations with learners to improve their English communication skills. Respond to the learner's input in English, using clear and simple language suitable for their level (beginner to intermediate). 
    Provide response on their input, keep the response concise (under 30 seconds) and relevant to the user's input, and introduce new vocabulary related to the topic. 
    Make the interaction educational, engaging, and fun, using analogies or examples related to the learner's topic.`,
          },
        ],
      },
      tools: [
        // there is a free-tier quota for search
        { googleSearch: {} },
        { functionDeclarations: [declaration,dictionary] },
      ],
    });
  }, [setConfig, setModel]);

  useEffect(() => {
    const onToolCall = (toolCall: LiveServerToolCall) => {
      if (!toolCall.functionCalls) {
        return;
      }
      // const fc = toolCall.functionCalls.find(
      //   (fc) => fc.name === declaration.name
      // );
      // if (fc) {
      //   const str = (fc.args as any)?.json_graph;
      //   setJSONString(str);
      // }
      // // send data for the response of your tool call
      // // in this case Im just saying it was successful
      // if (toolCall.functionCalls.length) {
      //   setTimeout(
      //     () =>
      //       client.sendToolResponse({
      //         functionResponses: toolCall.functionCalls?.map((fc) => ({
      //           response: { output: { success: true } },
      //           id: fc.id,
      //           name: fc.name,
      //         })),
      //       }),
      //     200
      //   );
      // }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedRef.current && jsonString) {
      console.log("jsonString", jsonString);
      vegaEmbed(embedRef.current, JSON.parse(jsonString));
    }
  }, [embedRef, jsonString]);
  return <div className="vega-embed" ref={embedRef} />;
}

export const Altair = memo(AltairComponent);
