sass:
	@echo Rendering /src/styles to /static/css please hold on🤙
	sass src/scss/:static/css/
	@echo Rendered all sass GG

sass-watch:
	@echo Started watching /src/styles🤙
	sass --watch src/scss/:static/css/
	