{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
    pre-commit-hooks = {
      url = "github:cachix/pre-commit-hooks.nix";
      inputs = {
        nixpkgs.follows = "nixpkgs";
      };
    };
  };

  outputs = {
    self,
    nixpkgs,
    pre-commit-hooks,
  }: let
    forEachSystem = nixpkgs.lib.genAttrs [
      "aarch64-darwin"
      "aarch64-linux"
      "x86_64-darwin"
      "x86_64-linux"
    ];
  in {
    checks = forEachSystem (system: let
      pre-commit-check = pre-commit-hooks.lib.${system}.run {
        src = ./.;
        hooks = {
          actionlint.enable = true;
          alejandra.enable = true;
          prettier.enable = true;
        };
      };
    in {
      inherit pre-commit-check;
    });

    devShells = forEachSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      default = pkgs.mkShell {
        packages = with pkgs; [
          nodejs
        ];

        shellHook = ''
          git config --unset-all core.hooksPath
          git config commit.template ./.github/commit-template
          ln -sf ../../git_hooks/prepare-commit-msg "$(git rev-parse --git-path hooks)/prepare-commit-msg"
          ${self.checks.${system}.pre-commit-check.shellHook}
          export PATH="$(pwd)/node_modules/.bin:$PATH"

          # Write the node version into a version-controlled file so we
          # can point the actions/setup-node GitHub Action to use the
          # same version.
          node --version > .nvmrc
        '';
      };
    });
  };
}
