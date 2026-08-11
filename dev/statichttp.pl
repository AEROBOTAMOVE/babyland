#!/usr/bin/perl
# Мъничък статичен сървър за преглед (само за разработка).
# Пускане:  perl dev/statichttp.pl 8791
use strict; use warnings;
use IO::Socket::INET;
use Cwd qw(abs_path getcwd);

my $port = $ARGV[0] || 8791;
my $root = getcwd();
my %MIME = (
  html => 'text/html; charset=utf-8', js => 'text/javascript; charset=utf-8',
  css  => 'text/css; charset=utf-8',  json => 'application/json; charset=utf-8',
  webmanifest => 'application/manifest+json; charset=utf-8',
  svg => 'image/svg+xml', png => 'image/png', jpg => 'image/jpeg',
  woff2 => 'font/woff2', ico => 'image/x-icon', md => 'text/plain; charset=utf-8',
);
my $srv = IO::Socket::INET->new(LocalAddr => '127.0.0.1', LocalPort => $port,
  Listen => 32, Reuse => 1) or die "не мога да отворя порт $port: $!";
print "static: http://127.0.0.1:$port/ от $root\n";
while (my $cl = $srv->accept) {
  my $req = <$cl>;
  while (defined(my $h = <$cl>)) { last if $h =~ /^\r?\n$/; }
  unless (defined $req and $req =~ m{^GET\s+(\S+)}) { close $cl; next; }
  my $path = $1; $path =~ s/\?.*$//; $path =~ s/%([0-9A-Fa-f]{2})/chr(hex($1))/ge;
  $path = '/index.html' if $path eq '/';
  my $file = $root . $path;
  my $ok = 0; my $real = eval { abs_path($file) };
  $ok = 1 if defined $real and index($real, abs_path($root)) == 0 and -f $real;
  if (!$ok) { print $cl "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n"; close $cl; next; }
  my ($ext) = $real =~ /\.([A-Za-z0-9]+)$/; $ext = lc($ext || '');
  my $type = $MIME{$ext} || 'application/octet-stream';
  open(my $fh, '<:raw', $real) or do { close $cl; next; };
  local $/; my $body = <$fh>; close $fh;
  print $cl "HTTP/1.1 200 OK\r\nContent-Type: $type\r\nContent-Length: " . length($body)
          . "\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n";
  print $cl $body;
  close $cl;
}
