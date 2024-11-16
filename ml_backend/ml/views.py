from django.shortcuts import render
from .models import ml_db
from django.http import HttpResponse
from rest_framework.views import APIView
# Create your views here.

def index(request):
    return HttpResponse("<h1>APP IS RUNNING</H1>")

import cv2
import os
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status
import yolo

# Load the YOLO model
model_yolo = yolo("patch-it\yajat\models\potholeDetectionYOLO6\weights\best.pt")

class ProcessVideoAPIView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        # Get the video file from the request
        video_file = request.FILES.get('video')
        if not video_file:
            return Response({"error": "No video file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save the uploaded video to a temporary file
        temp_input_path = 'temp_input.mp4'
        with open(temp_input_path, 'wb') as f:
            for chunk in video_file.chunks():
                f.write(chunk)

        # Define the path for the output video
        temp_output_path = 'temp_output.mp4'

        try:
            # Process the video with YOLO and generate an output video
            self.process_video_with_yolo(temp_input_path, temp_output_path)

            # Return the processed video as a response
            return FileResponse(
                open(temp_output_path, 'rb'),
                as_attachment=True,
                filename='processed_video.mp4'
            )
        except Exception as e:
            # Return an error response in case of failure
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            # Clean up temporary files
            if os.path.exists(temp_input_path):
                os.remove(temp_input_path)
            if os.path.exists(temp_output_path):
                os.remove(temp_output_path)

    def process_video_with_yolo(self, input_path, output_path):
        """
        Process the video frame by frame using the YOLO model.
        """
        # Load the video
        cap = cv2.VideoCapture(input_path)
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, 20.0, (int(cap.get(3)), int(cap.get(4))))

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Run YOLO inference on the frame
            processed_frame = model_yolo.infer(frame)  # Replace this with actual YOLO inference code
            
            # Write the processed frame to the output video
            out.write(processed_frame)

        cap.release()
        out.release()