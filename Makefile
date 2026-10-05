.PHONY: install uninstall doctor

install:
	@launchd/install.sh

uninstall:
	@launchd/uninstall.sh

doctor:
	@launchd/doctor.sh
