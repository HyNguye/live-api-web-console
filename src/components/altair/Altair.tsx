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
import NoteList from "../note-word/Notes";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import {
  FunctionDeclaration,
  FunctionResponse,
  LiveServerToolCall,
  Modality,
  Type,
} from "@google/genai";


const render_altair: FunctionDeclaration = {
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
const noteNewWord: FunctionDeclaration = {
  name: "note_new_word",
  description: "Notes a new vocabulary word for the user to learn. Only use this if the user asks you to note a new word or if you want to introduce a new word to the user.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      word: {
        type: Type.STRING,
        description:
          "The word to note for the user to learn. Must be a string.",
      },
      describe: {
        type: Type.STRING,
        description:
          "A description of the word to help the user understand its meaning and usage.",
      },
    },
    required: ["word"],
  },
};

function AltairComponent() {
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig, setModel } = useLiveAPIContext();
   const [notes, setNote] = useState<string[]>([]);
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
        { functionDeclarations: [render_altair,noteNewWord] },

      ],
    });
  }, [setConfig, setModel]);

  useEffect(() => {
    const onToolCall = (toolCall: LiveServerToolCall) => {
      if (!toolCall.functionCalls) {
        return;
      }
      const responsesToSend:FunctionResponse[] = [];

      for (const fc of toolCall.functionCalls) {
        switch (fc?.name) {
          case render_altair.name: {
            // this is the function call for the altair graph
            // we can get the json string from the args
            const str = (fc.args as any)?.json_graph;
            if (str) {
              setJSONString(str);
            }
            responsesToSend.push({
              response: { output: { success: true } },
              id: fc.id,
              name: fc.name,
            });
            break;
          }
          case noteNewWord.name: {
            // this is the function call for the dictionary check
            // we can get the word from the args
            const word = (fc.args as any)?.word;

            const describe = (fc.args as any)?.describe;
            setNote((prevNotes) => {
              if (word && !prevNotes.includes(word)) {
                return [...prevNotes, `${word}: ${describe}`];
              }
              return prevNotes;
            });
            if (word) {
              responsesToSend.push({
                response: { output: { success: true, word ,describe} },
                id: fc.id,
                name: fc.name,
              });
            }
            break;
          }
        }
      }
      // send the responses back to the client
      if (responsesToSend.length) {
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: responsesToSend,
            }),
          200
        );
      }

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
  return (
    <div className="altair-component">
      <NoteList notes={notes} />;
      <div className="vega-embed" ref={embedRef} />
    </div>
  );
}

export const Altair = memo(AltairComponent);
