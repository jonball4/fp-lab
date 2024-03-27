{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
  };

  outputs = {
    self,
    nixpkgs,
  }: let
    forEachSystem = nixpkgs.lib.genAttrs [
      "aarch64-darwin"
      "aarch64-linux"
      "x86_64-darwin"
      "x86_64-linux"
    ];
  in {
    devShells = forEachSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      default = pkgs.mkShell {
        packages = with pkgs; [
          nodejs-18_x
        ];

        shellHook = ''
          # Write the node version into a version-controlled file so we
          # can point the actions/setup-node GitHub Action to use the
          # same version.
          node --version > .nvmrc
        '';
      };
    });
  };
}
