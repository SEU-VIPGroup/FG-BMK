import json
import re
from collections import defaultdict

# Initialize counters
total_images = 0
correct_images = 0
class_accuracy = defaultdict(lambda: {'correct': 0, 'total': 0})

# Load the data from the JSONL file

with open('xxx/merge.jsonl', 'r') as f:
    data = [json.loads(line) for line in f]


# Group questions by image
image_questions = defaultdict(list)
for item in data:
    image_questions[item['image']].append(item)

# Check accuracy for each image's questions
for image, questions in image_questions.items():
    all_correct = True
    for question in questions:
        # Preprocess 'class' and 'text' by replacing underscores, hyphens, and multiple spaces with a single space
        processed_class = re.sub(r'[_\-,]+', ' ', question['class']).lower().strip()
        processed_text = re.sub(r'[_\-,]+', ' ', question['text']).lower().strip()

        # Check if processed 'class' appears in processed 'text'
        if processed_class in processed_text:
            class_accuracy[processed_class]['correct'] += 1
        else:
            all_correct = False
        
        class_accuracy[processed_class]['total'] += 1

    # Count the image as correctly classified if all questions are correct
    if all_correct:
        correct_images += 1

    total_images += 1

# Print the accuracy for each class
for class_name, stats in class_accuracy.items():
    accuracy = stats['correct'] / stats['total'] * 100
    print(f"Class '{class_name}': {stats['correct']}/{stats['total']} ({accuracy:.2f}%)")

# Print the overall results
print(f"Total images: {total_images}")
print(f"Correctly answered images: {correct_images}")
print(f"Overall Accuracy: {correct_images / total_images * 100:.2f}%")
