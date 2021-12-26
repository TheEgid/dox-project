import logging
import json
import sys
from utils import pdf_process, get_file_content


class DisableLogger:
    def __enter__(self):
        logging.disable(logging.CRITICAL)
        logging.disable(logging.INFO)
        logging.disable(logging.WARNING)

    def __exit__(self, exit_type, exit_value, exit_traceback):
        logging.disable(logging.NOTSET)


def file_processor(pdf_filepath):
    with DisableLogger():
        try:
            docx_path = pdf_process(in_filepath=pdf_filepath)
            file_content = get_file_content(docx_path)
            dict_out = json.dumps({
                'docxPath': docx_path,
                'fileContent': file_content
            })
            return dict_out
        except FileNotFoundError:
            return json.dumps({
                'docxPath': 'Error',
                'fileContent': 'Error'
            })


# Python 3.9.9 not more!
if __name__ == "__main__":
    if len(sys.argv) > 1:
        document = " ".join(sys.argv[1:])
        document = file_processor(document.strip())
        print(document)
