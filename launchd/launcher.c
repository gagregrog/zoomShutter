// Parent process for run.sh. macOS checks Accessibility against the process
// that launchd started, so this binary is the only one that needs the grant.
// It must stay alive while the app runs, so it spawns run.sh and does not exec.
#include <errno.h>
#include <signal.h>
#include <spawn.h>
#include <stdio.h>
#include <string.h>
#include <sys/wait.h>

extern char **environ;

static pid_t child = 0;

static void forward(int sig) {
  if (child > 0) {
    kill(-child, sig);
  }
}

int main(int argc, char *argv[]) {
  if (argc != 2) {
    fprintf(stderr, "usage: %s <script>\n", argv[0]);
    return 2;
  }

  posix_spawnattr_t attr;
  posix_spawnattr_init(&attr);
  posix_spawnattr_setflags(&attr, POSIX_SPAWN_SETPGROUP);
  posix_spawnattr_setpgroup(&attr, 0);

  char *args[] = {"/bin/bash", argv[1], NULL};
  int err = posix_spawn(&child, "/bin/bash", NULL, &attr, args, environ);
  posix_spawnattr_destroy(&attr);
  if (err != 0) {
    fprintf(stderr, "cannot start %s: %s\n", argv[1], strerror(err));
    return 1;
  }

  signal(SIGTERM, forward);
  signal(SIGINT, forward);
  signal(SIGHUP, forward);

  int status;
  while (waitpid(child, &status, 0) < 0) {
    if (errno != EINTR) {
      perror("waitpid");
      return 1;
    }
  }

  if (WIFEXITED(status)) {
    return WEXITSTATUS(status);
  }
  return 128 + WTERMSIG(status);
}
