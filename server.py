from flask import Flask, Response, jsonify
import cv2
from ultralytics import YOLO
from flask_cors import CORS
 
app = Flask(__name__)
CORS(app)  # Allow requests from React frontend
 
model = YOLO('yolov8n.pt')  # or yolov5n.pt
cheating_detected = False
 
import mediapipe as mp
import numpy as np
 
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)
 
def is_looking_straight(landmarks, frame_width, frame_height):
    # Use nose tip and eye landmarks for a rough estimation
    nose_tip = landmarks[1]
    left_eye = landmarks[33]
    right_eye = landmarks[263]
 
    nose_x = int(nose_tip.x * frame_width)
    left_eye_x = int(left_eye.x * frame_width)
    right_eye_x = int(right_eye.x * frame_width)
 
    face_center = (left_eye_x + right_eye_x) / 2
    deviation = abs(nose_x - face_center)
 
    return deviation < 20  # Threshold: adjust based on your lighting & angle
 
 
def gen_frames():
    global cheating_detected
    cap = cv2.VideoCapture(0)
 
    while True:
        success, frame = cap.read()
        if not success:
            break
 
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = model(frame)[0]
        face_results = face_mesh.process(frame_rgb)
 
        boxes = results.boxes
        person_count = 0
        cheating = False
        warning = False
        h, w = frame.shape[:2]
 
        for box in boxes:
            cls_id = int(box.cls[0].item())
            label = results.names[cls_id]
 
            if label in ["person", "cell phone"]:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                color = (0, 255, 0) if label == "person" else (0, 0, 255)
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
 
                if label == "person":
                    person_count += 1
                if label == "cell phone":
                    cheating = True
 
        # Head direction detection
        if face_results.multi_face_landmarks:
            for face_landmarks in face_results.multi_face_landmarks:
                if not is_looking_straight(face_landmarks.landmark, w, h):
                    warning = True
                    cv2.putText(frame, "⚠️ Not looking at screen", (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
 
        # Set global cheating flag
        if person_count > 1 or cheating or warning:
            cheating_detected = True
        else:
            cheating_detected = False
 
        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
 
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
 
 
@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
 
@app.route('/cheating_status')
def cheating_status():
    return jsonify({'cheating': cheating_detected})
 
if __name__ == '__main__':
    app.run(debug=True)