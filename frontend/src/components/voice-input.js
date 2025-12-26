"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, StopCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function VoiceInput({ onTranscript, placeholder = "Speak now..." }) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState(null)
  const [isSupported, setIsSupported] = useState(true)
  const [volume, setVolume] = useState(0)
  const recognitionRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const microphoneRef = useRef(null)
  const animationFrameRef = useRef(null)

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event) => {
          const current = event.resultIndex
          const transcriptText = event.results[current][0].transcript
          setTranscript(transcriptText)

          if (event.results[current].isFinal) {
            if (onTranscript) {
              onTranscript(transcriptText)
            }
          }
        }

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error:", event.error)
          if (event.error === "not-allowed") {
            setError("Microphone access denied. Please allow microphone access to use voice input.")
          } else if (event.error === "aborted") {
            // This is a common error that happens when stopping recognition
            // We can safely ignore it
          } else {
            setError(`Speech recognition error: ${event.error}`)
          }
          stopRecording()
        }

        recognitionRef.current.onend = () => {
          // Only set recording to false if it wasn't manually stopped
          if (isRecording) {
            setIsRecording(false)
          }
        }
      } else {
        setIsSupported(false)
        setError("Speech recognition is not supported in this browser. Try using Chrome, Edge, or Safari.")
      }
    }

    return () => {
      stopRecording()
    }
  }, [onTranscript])

  // Set up audio analyzer for volume visualization
  const setupAudioAnalyzer = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }

      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      microphoneRef.current = stream

      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      const updateVolume = () => {
        if (!analyserRef.current || !isRecording) return

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)

        // Calculate volume level (0-100)
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
        setVolume(Math.min(100, Math.max(0, average * 1.5))) // Scale for better visualization

        animationFrameRef.current = requestAnimationFrame(updateVolume)
      }

      updateVolume()
    } catch (err) {
      console.error("Error accessing microphone:", err)
      setError("Could not access microphone. Please check your permissions.")
      setIsRecording(false)
    }
  }

  const startRecording = () => {
    setError(null)
    setTranscript("")

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsRecording(true)
        setupAudioAnalyzer()
      }
    } catch (err) {
      console.error("Error starting speech recognition:", err)
      setError("Error starting speech recognition. Please try again.")
    }
  }

  const stopRecording = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }

      if (microphoneRef.current) {
        microphoneRef.current.getTracks().forEach((track) => track.stop())
        microphoneRef.current = null
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      setIsRecording(false)
    } catch (err) {
      console.error("Error stopping speech recognition:", err)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4">
        {isRecording ? (
          <Button
            onClick={stopRecording}
            variant="destructive"
            className="flex items-center gap-2"
            aria-label="Stop recording"
          >
            <StopCircle className="h-4 w-4" />
            Stop Recording
          </Button>
        ) : (
          <Button
            onClick={startRecording}
            variant="default"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
            disabled={!isSupported}
            aria-label="Start recording"
          >
            {isSupported ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            {isSupported ? "Start Recording" : "Not Supported"}
          </Button>
        )}

        {isRecording && (
          <div className="flex-1">
            <Progress value={volume} className="h-2 bg-gray-200" />
          </div>
        )}
      </div>

      <div className="min-h-[100px] p-3 border rounded-md bg-muted/20">
        {transcript ? (
          <p className="text-sm">{transcript}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{placeholder}</p>
        )}
      </div>
    </div>
  )
}
