import setuptools

with open('requirements.txt') as f:
    requirements = f.read().splitlines()


setuptools.setup(
    name="weatherforecast", # Replace with your own username
    version="0.0.1",
    install_requires = requirements,  # requirements.txt の内容をそのままコピー
    entry_points={
        'console_scripts': [
            'weatherforecast=weatherforecast:main',
        ],
    },
    packages=setuptools.find_packages(), # 直下のパッケージ仕様のフォルダ名をリスト形式で全て取得
    description="sample packages by legacy-setup.py",
    # author="author",
    # author_email="sample@example.com",
    # python_requires='>=3.7',
)
