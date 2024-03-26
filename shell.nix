{ pkgs ? import <nixpkgs> { } }:
with pkgs;
mkShell rec {
  name = "3dPortfolio";
  buildInputs = [
    nodejs
    figlet
    lolcat
  ];

  shellHook = ''
    ${figlet}/bin/figlet -w 100 -f basic "Welcome to ${name}" | ${lolcat}/bin/lolcat
  '';
}
